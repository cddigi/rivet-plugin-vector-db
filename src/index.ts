import type { RivetPlugin, RivetPluginInitializer } from "@ironclad/rivet-core";
import { addVectorNode } from "./nodes/AddVectorNode.js";

const plugin: RivetPluginInitializer = (rivet) => {
  const addVector = addVectorNode(rivet);
  const addVectorPlugin: RivetPlugin = {
    id: "vector-db-plugin",
    name: "Vector Database Plugin",
    configSpec: {},
    contextMenuGroups: [
      {
        id: "vector-db-plugin",
        label: "Vector DB",
      },
    ],
    register: (register) => {
      register(addVector);
    },
  };

  return addVectorPlugin;
};

export default plugin;
