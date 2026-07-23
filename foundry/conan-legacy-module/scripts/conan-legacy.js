const MODULE_ID = "conan-legacy";

Hooks.once("init", () => {
  console.log(`${MODULE_ID} | init`);
});

Hooks.once("ready", () => {
  const systemId = game.system?.id;
  const systemVersion = game.system?.version;

  if (systemId !== "swade") {
    ui.notifications?.warn("Conan Legacy foi preparado para o sistema SWADE.");
    return;
  }

  console.log(`${MODULE_ID} | ready on SWADE ${systemVersion}`);
});
