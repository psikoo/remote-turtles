export const UiManager = {
  init() {
    setupListener();
  },

  lockUI(isLocked: boolean) {
    const interactiveElements = document.querySelectorAll('button, input') as NodeListOf<HTMLElement>;
    interactiveElements.forEach(element => {
      if (isLocked) {
        element.setAttribute('disabled', 'true');
        element.style.opacity = '0.5';
        element.style.pointerEvents = 'none';
      } else {
        element.removeAttribute('disabled');
        element.style.opacity = '1';
        element.style.pointerEvents = 'auto';
      }
    });
  },
}

function setupListener() {
  // @ts-ignore
  window.electronAPI.onUILocked((isLocked: any) => {
    UiManager.lockUI(isLocked);
  });
}