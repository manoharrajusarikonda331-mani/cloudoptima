/* ==========================================================================
   CLOUDO-OPTIMA TERMINAL LOGGER
   Manages browser terminal output and scrolling logging interfaces
   ========================================================================== */

class TerminalLogger {
    constructor() {
        this.terminalElement = null;
    }

    // Bind log screen DOM element
    bindElement(element) {
        this.terminalElement = element;
    }

    // Output formatted logs
    log(message, type = 'info') {
        if (!this.terminalElement) return;

        const timestamp = new Date();
        const timeStr = `${String(timestamp.getHours()).padStart(2, '0')}:${String(timestamp.getMinutes()).padStart(2, '0')}:${String(timestamp.getSeconds()).padStart(2, '0')}.${String(timestamp.getMilliseconds()).padStart(3, '0')}`;
        
        const logItem = document.createElement('div');
        logItem.className = 'log-item';
        
        let typeBadge = '';
        let classColor = 'log-info';

        switch (type.toLowerCase()) {
            case 'info':
                typeBadge = '[INFO]';
                classColor = 'log-info';
                break;
            case 'warn':
                typeBadge = '[WARN]';
                classColor = 'log-warn';
                break;
            case 'success':
                typeBadge = '[SUCCESS]';
                classColor = 'log-success';
                break;
            case 'routing':
                typeBadge = '[ROUTING]';
                classColor = 'log-routing';
                break;
            case 'code':
                typeBadge = '>>';
                classColor = 'log-code';
                break;
            default:
                typeBadge = `[${type.toUpperCase()}]`;
                classColor = 'log-info';
        }

        logItem.innerHTML = `<span class="log-time">[${timeStr}]</span> <span class="${classColor}">${typeBadge} ${message}</span>`;
        
        this.terminalElement.appendChild(logItem);
        
        // Auto scroll to bottom
        this.terminalElement.scrollTop = this.terminalElement.scrollHeight;
    }

    // Clear log console
    clear() {
        if (this.terminalElement) {
            this.terminalElement.innerHTML = '';
            this.log("Terminal cleared. Awaiting FinOps instructions...", "info");
        }
    }
}

export const Logger = new TerminalLogger();
