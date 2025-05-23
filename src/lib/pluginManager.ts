import { Plugin } from "@/types/plugin-manager";
import { calcPlugin } from "./plugins/calc.plugin";
import { definePlugin } from "./plugins/define.plugin";
import { weatherPlugin } from "./plugins/weather.plugin";

export const registeredPlugins: Plugin[] = [
  weatherPlugin,
  calcPlugin,
  definePlugin,
];

interface PluginMatch {
  type: "plugin_match";
  plugin: Plugin;
  args: string[];
}

interface NoMatch {
  type: "no_match";
}

export type ProcessedMessageResult = PluginMatch | NoMatch;

/**
 * TODO: Parses the user's message to find a matching plugin.
 * TODO: Does not execute the plugin.
 */

export const findPluginForMessage = (
  messageContent: string
): ProcessedMessageResult => {
  for (const plugin of registeredPlugins) {
    const match = plugin.trigger.exec(messageContent);
    if (match) {
      const args = match
        .slice(1)
        .map((arg) => arg.trim())
        .filter((arg) => arg.length > 0);
      return { type: "plugin_match", plugin, args };
    }
  }
  return { type: "no_match" };
};
