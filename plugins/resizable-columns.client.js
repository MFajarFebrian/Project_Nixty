export default defineNuxtPlugin((nuxtApp) => {
  const MIN_WIDTH = 60;

  const directive = {
    mounted(el) {
      const table = el.closest('table');
      if (table) {
        table.style.tableLayout = 'fixed';
      }

      el.style.position = 'relative';
      el.style.userSelect = 'none';

      const grip = document.createElement('div');
      grip.style.position = 'absolute';
      grip.style.right = '0';
      grip.style.top = '0';
      grip.style.bottom = '0';
      grip.style.width = '6px';
      grip.style.cursor = 'col-resize';
      grip.style.zIndex = '10';
      grip.style.background = 'transparent';

      grip.addEventListener('mousedown', (e) => {
        // Stop the event from bubbling up to the table wrapper's drag-scroll handler
        e.stopPropagation();
        e.preventDefault();

        // Set a global flag to indicate resizing is active
        document.body.setAttribute('data-resizing', 'true');

        const th = el;
        const table = th.closest('table');
        if (!table) return;

        const thIndex = Array.from(th.parentElement.children).indexOf(th);
        const col = table.querySelectorAll('col')[thIndex];
        if (!col) {
          console.error('Resizable column: Could not find <col> element for a <th>. Make sure your table has a <colgroup>.');
          return;
        }

        const startX = e.pageX;
        // Use the actual current width of the <th> as the starting width because
        // <col> elements often report offsetWidth = 0 until a width is explicitly set.
        const startWidth = el.offsetWidth;
        // Ensure the col starts with a concrete width so subsequent calculations work.
        col.style.width = startWidth + 'px';
        let animationFrameId = null;

        document.body.style.cursor = 'col-resize';

        function onMouseMove(ev) {
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
          }

          animationFrameId = requestAnimationFrame(() => {
            const delta = ev.pageX - startX;
            const newWidth = Math.max(MIN_WIDTH, startWidth + delta);
            // Apply the new calculated width directly to the corresponding <col> element
            col.style.width = newWidth + 'px';
          });
        }

        function onMouseUp() {
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
          }
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
          document.body.style.cursor = '';
          
          // Remove the global flag
          document.body.removeAttribute('data-resizing');
        }

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      });

      el.appendChild(grip);
    },
  };

  nuxtApp.vueApp.directive('resizable-column', directive);
});

