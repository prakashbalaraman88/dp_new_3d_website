export const AI_COMMAND_EVENT = 'AI_COMMAND_EVENT';

export type AIActionType = 'NAVIGATE' | 'UPDATE_CALCULATOR';

export interface AIAction {
    type: AIActionType;
    payload: any;
}

export interface NavigatePayload {
    path: string;
}

export interface UpdateCalculatorPayload {
    clientName?: string;
    builtUpArea?: number;
    tier?: string; // 'civitas' | 'urbane' | ...
    showLuxury?: boolean;
    // We can add more granular controls later if needed
}

export interface AICommandEvent extends CustomEvent {
    detail: AIAction;
}

// Helper to dispatch events safely
export const dispatchAICommand = (action: AIAction) => {
    const event = new CustomEvent(AI_COMMAND_EVENT, { detail: action });
    window.dispatchEvent(event);
};
