/**
 * Keyboard Shortcut Handler
 * Maps keyboard shortcuts to actions for power users
 */
export interface KeyboardShortcut {
  key: string;
  modifiers: string[]; // ['ctrl', 'alt', 'shift']
  action: string;
  description: string;
  category: 'navigation' | 'editing' | 'payment' | 'search' | 'system';
}

/**
 * Keyboard Action Handler Result
 */
export interface KeyboardActionResult {
  handled: boolean;
  action?: string;
  message?: string;
}

/**
 * Keyboard Interface Manager
 * Handles keyboard shortcuts for power users
 */
export class KeyboardInterfaceManager {
  private static shortcuts: KeyboardShortcut[] = [
    // Navigation
    {
      key: 'F1',
      modifiers: [],
      action: 'search_advanced',
      description: 'Búsqueda avanzada (por principio activo)',
      category: 'search',
    },
    {
      key: 'F2',
      modifiers: [],
      action: 'search_barcode',
      description: 'Escanear código de barras',
      category: 'search',
    },
    {
      key: 'F3',
      modifiers: [],
      action: 'view_customer',
      description: 'Ver información del cliente',
      category: 'navigation',
    },
    {
      key: 'F4',
      modifiers: [],
      action: 'view_product_details',
      description: 'Ver detalles del producto',
      category: 'navigation',
    },
    
    // Editing
    {
      key: 'F5',
      modifiers: [],
      action: 'change_price',
      description: 'Cambiar precio (requiere autorización)',
      category: 'editing',
    },
    {
      key: 'F6',
      modifiers: [],
      action: 'edit_quantity',
      description: 'Editar cantidad',
      category: 'editing',
    },
    {
      key: 'F7',
      modifiers: [],
      action: 'edit_discount',
      description: 'Aplicar descuento',
      category: 'editing',
    },
    {
      key: 'F8',
      modifiers: [],
      action: 'remove_item',
      description: 'Eliminar ítem',
      category: 'editing',
    },
    {
      key: 'Delete',
      modifiers: [],
      action: 'remove_item',
      description: 'Eliminar ítem actual',
      category: 'editing',
    },
    
    // Payment
    {
      key: 'F10',
      modifiers: [],
      action: 'totalize_and_pay',
      description: 'Totalizar y procesar pago',
      category: 'payment',
    },
    {
      key: 'F12',
      modifiers: [],
      action: 'cancel_sale',
      description: 'Cancelar venta',
      category: 'payment',
    },
    {
      key: 'Enter',
      modifiers: [],
      action: 'add_item',
      description: 'Agregar producto seleccionado',
      category: 'editing',
    },
    {
      key: 'Ctrl',
      modifiers: [],
      action: 'payment_mixto',
      description: 'Pago mixto (Divisas + Bolívares)',
      category: 'payment',
    },
    {
      key: 'P',
      modifiers: ['ctrl'],
      action: 'print',
      description: 'Imprimir factura',
      category: 'system',
    },
    
    // Search
    {
      key: 'P',
      modifiers: ['ctrl'],
      action: 'search_substitutes',
      description: 'Consulta rápida de sustitutos (genéricos)',
      category: 'search',
    },
    
    // System
    {
      key: 'Escape',
      modifiers: [],
      action: 'cancel',
      description: 'Cancelar acción actual',
      category: 'system',
    },
    {
      key: 'F9',
      modifiers: [],
      action: 'toggle_hold',
      description: 'Bloquear venta',
      category: 'system',
    },
    {
      key: 'S',
      modifiers: ['ctrl'],
      action: 'save_draft',
      description: 'Guardar borrador',
      category: 'system',
    },
  ];

  /**
   * Handle keyboard event
   */
  static handleKeyPress(event: KeyboardEvent): KeyboardActionResult {
    const key = event.key;
    const modifiers: string[] = [];
    
    if (event.ctrlKey) modifiers.push('ctrl');
    if (event.altKey) modifiers.push('alt');
    if (event.shiftKey) modifiers.push('shift');
    
    // Find matching shortcut
    const shortcut = this.shortcuts.find(s => 
      s.key === key && 
      this.modifiersMatch(s.modifiers, modifiers)
    );

    if (shortcut) {
      return {
        handled: true,
        action: shortcut.action,
        message: `Acción: ${shortcut.description}`,
      };
    }

    return {
      handled: false,
    };
  }

  /**
   * Check if modifiers match
   */
  private static modifiersMatch(shortcutModifiers: string[], eventModifiers: string[]): boolean {
    if (shortcutModifiers.length !== eventModifiers.length) {
      return false;
    }
    
    return shortcutModifiers.every(mod => eventModifiers.includes(mod));
  }

  /**
   * Execute keyboard action
   */
  static executeAction(action: string): KeyboardActionResult {
    switch (action) {
      case 'search_advanced':
        return {
          handled: true,
          action: 'search_advanced',
          message: 'Abriendo búsqueda avanzada por principio activo',
        };
      case 'search_barcode':
        return {
          handled: true,
          action: 'search_barcode',
          message: 'Esperando escaneo de código de barras...',
        };
      case 'view_customer':
        return {
          handled: true,
          action: 'view_customer',
          message: 'Mostrando información del cliente',
        };
      case 'view_product_details':
        return {
          handled: true,
          action: 'view_product_details',
          message: 'Mostrando detalles del producto',
        };
      case 'change_price':
        return {
          handled: true,
          action: 'change_price',
          message: 'Solicitando cambio de precio (requiere autorización)',
        };
      case 'edit_quantity':
        return {
          handled: true,
          action: 'edit_quantity',
          message: 'Modo edición de cantidad activado',
        };
      case 'edit_discount':
        return {
          handled: true,
          action: 'edit_discount',
          message: 'Aplicando descuento...',
        };
      case 'remove_item':
        return {
          handled: true,
          action: 'remove_item',
          message: 'Ítem eliminado',
        };
      case 'totalize_and_pay':
        return {
          handled: true,
          action: 'totalize_and_pay',
          message: 'Totalizando y procesando pago...',
        };
      case 'cancel_sale':
        return {
          handled: true,
          action: 'cancel_sale',
          message: 'Venta cancelada',
        };
      case 'add_item':
        return {
          handled: true,
          action: 'add_item',
          message: 'Producto agregado',
        };
      case 'payment_mixto':
        return {
          handled: true,
          action: 'payment_mixto',
          message: 'Modo pago mixto activado (Divisas + Bolívares)',
        };
      case 'print':
        return {
          handled: true,
          action: 'print',
          message: 'Imprimiendo factura...',
        };
      case 'search_substitutes':
        return {
          handled: true,
          action: 'search_substitutes',
          message: 'Buscando sustitutos (genéricos) disponibles...',
        };
      case 'cancel':
        return {
          handled: true,
          action: 'cancel',
          message: 'Acción cancelada',
        };
      case 'toggle_hold':
        return {
          handled: true,
          action: 'toggle_hold',
          message: 'Venta bloqueada/desbloqueada',
        };
      case 'save_draft':
        return {
          handled: true,
          action: 'save_draft',
          message: 'Borrador guardado',
        };
      default:
        return {
          handled: false,
        };
    }
  }

  /**
   * Get all shortcuts
   */
  static getAllShortcuts(): KeyboardShortcut[] {
    return [...this.shortcuts];
  }

  /**
   * Get shortcuts by category
   */
  static getShortcutsByCategory(category: string): KeyboardShortcut[] {
    return this.shortcuts.filter(s => s.category === category);
  }

  /**
   * Get shortcut by action
   */
  static getShortcutByAction(action: string): KeyboardShortcut | undefined {
    return this.shortcuts.find(s => s.action === action);
  }

  /**
   * Get keyboard help text
   */
  static getKeyboardHelpText(): string {
    const categories = {
      navigation: 'Navegación',
      editing: 'Edición',
      payment: 'Pago',
      search: 'Búsqueda',
      system: 'Sistema',
    };

    let help = '=== AYUDAS DE TECLADO ===\n\n';
    
    for (const [categoryName, categoryNameES] of Object.entries(categories)) {
      const shortcuts = this.getShortcutsByCategory(categoryName);
      if (shortcuts.length === 0) continue;
      
      help += `--- ${categoryNameES.toUpperCase()} ---\n`;
      
      shortcuts.forEach(shortcut => {
        const modifiers = shortcut.modifiers.length > 0 
          ? shortcut.modifiers.join('+').toUpperCase() + '+'
          : '';
        const key = `${modifiers}${shortcut.key}`;
        
        help += `${key}: ${shortcut.description}\n`;
      });
      
      help += '\n';
    }

    help += '=== NOTAS ===\n';
    help += '- F1: Búsqueda avanzada por principio activo (no solo marca)\n';
    help += '- F5: Cambio de precio requiere autorización de supervisor\n';
    help += '- F10: Totalizar y procesar pago mixto (Divisas + Bolívares)\n';
    help += '- CTRL+P: Consulta rápida de sustitutos genéricos disponibles\n';
    help += '- F9: Bloquea venta para autorización\n';
    help += '- CTRL+S: Guarda borrador para continuar después\n';

    return help;
  }
}
