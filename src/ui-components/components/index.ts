// ui-components/components/index.ts
import { UIComponentService } from "../services/UIComponentService";
import { buttonComponent, iconButtonComponent } from "./button";
import { cardComponent, actionCardComponent } from "./card";
import { textInputComponent } from "./input";
import {
  containerComponent,
  gridComponent,
  gridItemComponent,
  flexComponent,
} from "./layout";
import { formComponent, formFieldComponent } from "./form";
import { alertComponent, customAlertComponent } from "./alert";

/**
 * Register all components with the component service
 */
export async function registerComponents(
  service: UIComponentService
): Promise<void> {
  // Register button components
  service.registerComponent(buttonComponent);
  service.registerComponent(iconButtonComponent);

  // Register card components
  service.registerComponent(cardComponent);
  service.registerComponent(actionCardComponent);

  // Register form components
  service.registerComponent(textInputComponent);
  service.registerComponent(formComponent);
  service.registerComponent(formFieldComponent);

  // Register feedback components
  service.registerComponent(alertComponent);
  service.registerComponent(customAlertComponent);

  // Register layout components
  service.registerComponent(containerComponent);
  service.registerComponent(gridComponent);
  service.registerComponent(gridItemComponent);
  service.registerComponent(flexComponent);

  console.log("Registered UI components");
}
