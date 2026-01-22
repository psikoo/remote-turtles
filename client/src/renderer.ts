import { InputManager, SceneManager, UiManager, WorldManager } from "./managers/renderer";

// Handle input
InputManager.init();
UiManager.init();

// Handle 3D
SceneManager.init();
WorldManager.init();

function animate() {
  requestAnimationFrame(animate);
  SceneManager.getControls().update();
  SceneManager.getRenderer().render(SceneManager.getScene(), SceneManager.getCamera());
}
animate();