export default {
    install(app) {
      app.config.globalProperties.$devtools = {
        connect(host = 'localhost', port = 8098) {
          try {
            const ws = new WebSocket(`ws://${host}:${port}`);
            
            ws.onopen = () => {
              ws.send(JSON.stringify({
                command: 'register',
                app: app
              }));
              console.log('[Vue DevTools] Connected successfully');
            };
  
            ws.onerror = (error) => {
              console.error('[Vue DevTools] Connection error:', error);
            };
  
            ws.onclose = () => {
              console.warn('[Vue DevTools] Connection closed');
            };
          } catch (error) {
            console.error('[Vue DevTools] Initialization failed:', error);
          }
        }
      };
    }
  };