export interface ShareCardInput {
  percentage: number;
  label: string;
  line: string;
  action: string;
}

/** The public boundary for score sharing: callers cannot pass the whole state. */
export function toShareCardInput(input: ShareCardInput): ShareCardInput {
  return {
    percentage: input.percentage,
    label: input.label,
    line: input.line,
    action: input.action,
  };
}

export function scoreShareText(input: ShareCardInput): string {
  return `cyncd Score: ${input.percentage}% — ${input.label}\n${input.line}\nToday: ${input.action}`;
}
