// File: scripts/main.js

Hooks.once('init', () => {
  console.log('click-to-scene-v13 | Initialized');
});

Hooks.on('getDrawingConfig', (drawing, config) => {
  console.log('click-to-scene-v13 | getDrawingConfig called for', drawing.document.name);
  config.tabs.push({
    navSelector: '.sheet-body',
    title: 'Hotspot',
    icon: 'fas fa-map-signs',
    tabId: 'click2scene'
  });
  const html = config.html;
  html.find('.sheet-body').append(`
    <div id="click2scene" style="margin-top:10px;">
      <label>Target Scene:</label>
      <select name="flags.click-to-scene-v13.targetScene">
        <option value="">— Select Scene —</option>
        ${game.scenes.map(s => `
          <option value="${s.id}" ${drawing.document.getFlag('click-to-scene-v13','targetScene')===s.id?'selected':''}>
            ${s.name}
          </option>`).join('')}
      </select>
    </div>
  `);
});

Hooks.on('canvasReady', () => {
  canvas.app.renderer.plugins.interaction.on('pointerdown', event => {
    const { x, y } = event.data.getLocalPosition(canvas.stage);
    for ( let draw of canvas.drawings.placeables ) {
      const target = draw.document.getFlag('click-to-scene-v13','targetScene');
      if (!target) continue;
      const b = draw.object.getBounds();
      if (x>=b.x && x<=b.x+b.width && y>=b.y && y<=b.y+b.height) {
        const scene = game.scenes.get(target);
        if (scene) scene.activate();
      }
    }
  });
});
