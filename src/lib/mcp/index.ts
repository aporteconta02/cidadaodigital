import { defineMcp } from "@lovable.dev/mcp-js";
import echoTool from "./tools/echo";

export default defineMcp({
  name: "cidadao-conectado-mcp",
  title: "Cidadão Conectado MCP",
  version: "0.1.0",
  instructions:
    "Ferramentas do app Cidadão Conectado. Use `echo` para verificar a conectividade do servidor MCP.",
  tools: [echoTool],
});
