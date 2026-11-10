interface BaseField {
    id: string;
    label: string;
    placeholder?: string;
    title?: string;
}

interface LabelField extends BaseField {
    type: 'label';
    value: never;
}

interface TextField extends BaseField {
    type: 'text';
    value: string;
}

interface NumberField extends BaseField {
    type: 'number';
    value: number;
    min?: number;
    max?: number;
    step?: number;
}

interface PasswordField extends BaseField {
    type: 'password';
    value: string;
}

interface EmailField extends BaseField {
    type: 'email';
    value: string;
}

interface DateField extends BaseField {
    type: 'date';
    value: string;
}

interface TimeField extends BaseField {
    type: 'time';
    value: string;
}

interface RadioField extends BaseField {
    type: 'radio';
    options: { label: string; value: string }[];
    value: string;
}

export type PromptField = LabelField | TextField | NumberField | PasswordField | EmailField | DateField | TimeField | RadioField;
export type PromptFieldObject = Record<string, PromptField>;
