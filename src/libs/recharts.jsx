import { jsx as _jsx } from "react/jsx-runtime";
import { Tooltip as UpstreamTooltip, } from "recharts-upstream";
export * from "recharts-upstream";
export function Tooltip(props) {
    // The type parameters only narrow what the callbacks declare; recharts 2 erased them the same way.
    return _jsx(UpstreamTooltip, { ...props });
}
