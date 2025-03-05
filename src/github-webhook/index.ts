  // github-webhook/index.ts
  import { Module, ModuleContext, ModuleState, ServiceDefinition } from '../module-system/ModuleSystem';
  import { HttpRequestHandler, HttpServerService } from '../http-server';
  import { Server } from 'bun';
  import { Webhook } from 'svix';
  import { exec } from 'child_process';
  import { promisify } from 'util';
  import { join } from 'path';
  import { existsSync, mkdirSync } from 'fs';
  
  // Promisify exec
  const execAsync = promisify(exec);
  
  /**
   * GitHub webhook configuration
   */
  export interface GitHubWebhookConfig {
    /**
     * Path to handle webhook requests on
     * @default "/webhook/github"
     */
    path: string;
    
    /**
     * Secret key for webhook verification
     * @default ""
     */
    webhookSecret: string;
    
    /**
     * Base directory for cloning repositories
     * @default "./repos"
     */
    reposDir: string;
    
    /**
     * Allowed repositories (empty means all are allowed)
     * @default []
     */
    allowedRepos: string[];
    
    /**
     * Whether to automatically install dependencies
     * @default true
     */
    installDependencies: boolean;
    
    /**
     * Whether to run build scripts after deployment
     * @default true
     */
    runBuildScripts: boolean;
  }
  
  /**
   * GitHub webhook service
   */
  export interface GitHubWebhookService {
    /**
     * Register a deployment handler
     * @param handler Function to call after successful deployment
     * @returns Function to unregister the handler
     */
    registerDeploymentHandler(handler: (repo: string, branch: string, commitSha: string) => void): () => void;
    
    /**
     * Get the webhook configuration
     */
    getConfig(): GitHubWebhookConfig;
    
    /**
     * Set the webhook configuration
     */
    setConfig(config: Partial<GitHubWebhookConfig>): void;
    
    /**
     * Manually trigger a deployment
     */
    triggerDeployment(repoUrl: string, branch?: string): Promise<boolean>;
  }
  
  /**
   * GitHub webhook module
   */
  export class GitHubWebhookModule implements Module {
    private context: ModuleContext | null = null;
    private state: ModuleState = ModuleState.REGISTERED;
    private httpService: HttpServerService | null = null;
    private config: GitHubWebhookConfig = {
      path: '/webhook/github',
      webhookSecret: '',
      reposDir: './repos',
      allowedRepos: [],
      installDependencies: true,
      runBuildScripts: true
    };
    private unregisterHttpHandler: (() => void) | null = null;
    private deploymentHandlers: Array<(repo: string, branch: string, commitSha: string) => void> = [];
    
    /**
     * Initialize the GitHub webhook module
     */
    async initialize(context: ModuleContext): Promise<boolean> {
      try {
        this.state = ModuleState.LOADING;
        this.context = context;
        
        // Get HTTP server service
        this.httpService = context.services.getService('httpServer') as HttpServerService;
        if (!this.httpService) {
          console.error('HTTP server service not found');
          this.state = ModuleState.ERROR;
          return false;
        }
        
        // Load configuration from store if available
        const storedConfig = await context.store.get('config');
        if (storedConfig) {
          this.config = { ...this.config, ...storedConfig };
        }
        
        // Ensure repositories directory exists
        if (!existsSync(this.config.reposDir)) {
          mkdirSync(this.config.reposDir, { recursive: true });
        }
        
        // Register the HTTP request handler
        const httpHandler: HttpRequestHandler = {
          handleRequest: this.handleRequest.bind(this)
        };
        
        this.unregisterHttpHandler = this.httpService.registerHandler(httpHandler, 100);
        
        // Create the GitHub webhook service
        const service: GitHubWebhookService = {
          registerDeploymentHandler: this.registerDeploymentHandler.bind(this),
          getConfig: this.getConfig.bind(this),
          setConfig: this.setConfig.bind(this),
          triggerDeployment: this.triggerDeployment.bind(this)
        };
        
        // Register the GitHub webhook service
        const serviceDefinition: ServiceDefinition = {
          id: 'githubWebhook',
          implementation: service,
          version: '1.0.0',
          metadata: {
            description: 'GitHub webhook service for automatic deployment'
          }
        };
        
        context.services.registerService(serviceDefinition);
        
        // Subscribe to configuration changes
        context.store.subscribe('config', (newConfig) => {
          console.log('GitHub webhook configuration changed:', newConfig);
          this.config = { ...this.config, ...newConfig };
        });
        
        this.state = ModuleState.ACTIVE;
        return true;
      } catch (error) {
        console.error('Error initializing GitHub webhook module:', error);
        this.state = ModuleState.ERROR;
        return false;
      }
    }
    
    /**
     * Stop the GitHub webhook module
     */
    async stop(): Promise<boolean> {
      try {
        // Unregister HTTP handler
        if (this.unregisterHttpHandler) {
          this.unregisterHttpHandler();
        }
        
        this.state = ModuleState.STOPPED;
        return true;
      } catch (error) {
        console.error('Error stopping GitHub webhook module:', error);
        this.state = ModuleState.ERROR;
        return false;
      }
    }
    
    /**
     * Get the module state
     */
    getState(): ModuleState {
      return this.state;
    }
    
    /**
     * Get the module manifest
     */
    getManifest(): any {
      return {
        id: 'github-webhook',
        name: 'GitHub Webhook',
        description: 'GitHub webhook handler for automatic deployment',
        version: '1.0.0',
        entryPoint: 'index.ts',
        capabilities: ['github-webhook'],
        dependencies: {
          'http-server': '^1.0.0'
        }
      };
    }
    
    /**
     * Get the module API
     */
    getAPI(): Record<string, any> {
      return {
        triggerDeployment: this.triggerDeployment.bind(this)
      };
    }
    
    /**
     * Handle an HTTP request for GitHub webhook
     */
    private async handleRequest(request: Request, server: Server): Promise<Response | undefined> {
      const url = new URL(request.url);
      
      // Check if this is a webhook request
      if (url.pathname !== this.config.path || request.method !== 'POST') {
        return undefined;
      }
      
      try {
        // Parse the payload
        const payload = await request.json();
        
        // Verify webhook signature if secret is configured
        if (this.config.webhookSecret) {
          const signature = request.headers.get('x-hub-signature-256');
          
          if (!signature) {
            console.error('Missing GitHub signature');
            return new Response('Unauthorized', { status: 401 });
          }
          
          const webhook = new Webhook(this.config.webhookSecret);
          const body = JSON.stringify(payload);
          
          try {
            webhook.verify(body, signature);
          } catch (err) {
            console.error('Invalid GitHub signature', err);
            return new Response('Invalid signature', { status: 401 });
          }
        }
        
        // Get event type
        const event = request.headers.get('x-github-event');
        
        // Handle push event
        if (event === 'push') {
          return await this.handlePushEvent(payload);
        }
        
        // Ignore other events
        return new Response('Event ignored', { status: 200 });
      } catch (error) {
        console.error('Error handling GitHub webhook:', error);
        return new Response('Error processing webhook', { status: 500 });
      }
    }
    
    /**
     * Handle GitHub push event
     */
    private async handlePushEvent(payload: any): Promise<Response> {
      const repo = payload.repository?.name;
      const repoUrl = payload.repository?.clone_url;
      const branch = payload.ref?.replace('refs/heads/', '');
      const commitSha = payload.after;
      
      if (!repo || !repoUrl) {
        return new Response('Missing repository information', { status: 400 });
      }
      
      // Check if repository is allowed
      if (this.config.allowedRepos.length > 0 && !this.config.allowedRepos.includes(repo)) {
        console.warn(`Repository ${repo} not in allowed list`);
        return new Response('Repository not allowed', { status: 403 });
      }
      
      try {
        // Deploy the repository
        await this.deployRepository(repoUrl, repo, branch, commitSha);
        
        return new Response('Deployed successfully', { status: 200 });
      } catch (error) {
        console.error(`Deployment error for ${repo}:`, error);
        return new Response(`Deployment error: ${error}`, { status: 500 });
      }
    }
    
    /**
     * Deploy a repository
     */
    private async deployRepository(
      repoUrl: string, 
      repo: string, 
      branch = 'main',
      commitSha = ''
    ): Promise<void> {
      const repoPath = join(this.config.reposDir, repo);
      
      console.log(`Deploying ${repo} from ${repoUrl} (branch: ${branch})`);
      
      try {
        if (existsSync(repoPath)) {
          // Update existing repo
          await execAsync(`cd ${repoPath} && git fetch && git checkout ${branch} && git pull`);
        } else {
          // Clone new repo
          await execAsync(`git clone -b ${branch} ${repoUrl} ${repoPath}`);
        }
        
        // Install dependencies if enabled
        if (this.config.installDependencies) {
          // Check if package.json exists
          if (existsSync(join(repoPath, 'package.json'))) {
            // Detect package manager
            if (existsSync(join(repoPath, 'yarn.lock'))) {
              await execAsync(`cd ${repoPath} && yarn install`);
            } else if (existsSync(join(repoPath, 'pnpm-lock.yaml'))) {
              await execAsync(`cd ${repoPath} && pnpm install`);
            } else if (existsSync(join(repoPath, 'bun.lockb'))) {
              await execAsync(`cd ${repoPath} && bun install`);
            } else {
              await execAsync(`cd ${repoPath} && npm install`);
            }
          }
        }
        
        // Run build scripts if enabled
        if (this.config.runBuildScripts) {
          // Check if package.json exists
          if (existsSync(join(repoPath, 'package.json'))) {
            const packageJson = require(join(repoPath, 'package.json'));
            
            // Check if build script exists
            if (packageJson.scripts && packageJson.scripts.build) {
              await execAsync(`cd ${repoPath} && npm run build`);
            }
          }
        }
        
        console.log(`Successfully deployed ${repo}`);
        
        // Notify deployment handlers
        for (const handler of this.deploymentHandlers) {
          try {
            handler(repo, branch, commitSha);
          } catch (error) {
            console.error(`Error in deployment handler:`, error);
          }
        }
      } catch (error) {
        console.error(`Deployment error for ${repo}:`, error);
        throw error;
      }
    }
    
    /**
     * Register a deployment handler
     */
    private registerDeploymentHandler(
      handler: (repo: string, branch: string, commitSha: string) => void
    ): () => void {
      this.deploymentHandlers.push(handler);
      
      return () => {
        const index = this.deploymentHandlers.indexOf(handler);
        if (index !== -1) {
          this.deploymentHandlers.splice(index, 1);
        }
      };
    }
    
    /**
     * Get the webhook configuration
     */
    private getConfig(): GitHubWebhookConfig {
      return { ...this.config };
    }
    
    /**
     * Set the webhook configuration
     */
    private setConfig(config: Partial<GitHubWebhookConfig>): void {
      this.config = { ...this.config, ...config };
      
      // Update store if context is available
      if (this.context) {
        this.context.store.set('config', this.config);
      }
    }
    
    /**
     * Manually trigger a deployment
     */
    private async triggerDeployment(repoUrl: string, branch = 'main'): Promise<boolean> {
      try {
        // Extract repo name from URL
        const repoName = repoUrl.split('/').pop()?.replace('.git', '') || '';
        
        await this.deployRepository(repoUrl, repoName, branch);
        return true;
      } catch (error) {
        console.error('Error triggering deployment:', error);
        return false;
      }
    }
  }
  
  /**
   * Create the GitHub webhook module
   */
  export function createModule(): Module {
    return new GitHubWebhookModule();
  }