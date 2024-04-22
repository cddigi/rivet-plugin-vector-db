import type {
  ChartNode,
  EditorDefinition,
  Inputs,
  InternalProcessContext,
  NodeBodySpec,
  NodeConnection,
  NodeId,
  NodeInputDefinition,
  NodeOutputDefinition,
  NodeUIData,
  Outputs,
  PluginNodeImpl,
  PortId,
  Project,
  Rivet,
} from "@ironclad/rivet-core";

import { VectorDB } from "imvectordb";
import { db } from "../db.js";

export type AddVectorNode = ChartNode<
  "addVector",
  {
    id: string;
    embedding: number[];
    metadata: { key: string; value: any }[];
    useMetadataInput?: boolean;
  }
>;

export const addVectorNode = (rivet: typeof Rivet) => {
  const impl: PluginNodeImpl<AddVectorNode> = {
    create(): AddVectorNode {
      const node: AddVectorNode = {
        id: rivet.newId<NodeId>(),

        data: {
          id: "",
          embedding: [],
          metadata: [],
        },
        title: "Add Vector Embedding Node",
        type: "addVector",
        visualData: {
          x: 0,
          y: 0,
          width: 200,
        },
      };

      return node;
    },

    getInputDefinitions(data): NodeInputDefinition[] {
      const inputs: NodeInputDefinition[] = [];

      inputs.push({
        id: "id" as PortId,
        dataType: "string",
        title: "ID",
      });
      inputs.push({
        id: "embedding" as PortId,
        dataType: "vector",
        title: "Embedding",
      });
      inputs.push({
        id: "metadata" as PortId,
        dataType: "any[]",
        title: "Metadata",
      });

      return inputs;
    },

    getOutputDefinitions(): NodeOutputDefinition[] {
      return [
        {
          id: "id" as PortId,
          dataType: "string",
          title: "ID",
        },
      ];
    },

    getUIData(): NodeUIData {
      return {
        contextMenuTitle: "Add Vector",
        group: "Vector DB",
        infoBoxBody:
          "This is a node for adding text to the in-memory vector database.",
        infoBoxTitle: "Add Vector Node",
      };
    },

    getEditors() {
      return [
        {
          type: "keyValuePair",
          dataKey: "metadata",
          label: "Metadata",
          useInputToggleDataKey: "useMetadataInput",
          helperMessage: "Metadata to attach to the item.",
          keyPlaceholder: "Key",
          valuePlaceholder: "Value",
        },
      ];
    },

    getBody(data): string | NodeBodySpec | NodeBodySpec[] | undefined {
      return rivet.dedent`
        Add Vector Node
        ID: ${data.id ? "(Using Input)" : data.id}
        Metadata: ${data.metadata ? "(Using Input)" : data.metadata}
      `;
    },

    async process(data, inputData, context): Promise<Outputs> {
      const someData = rivet.getInputOrData(data, inputData, "id", "string");

      return {
        ["someData" as PortId]: {
          type: "string",
          value: someData,
        },
      };
    },
  };

  return rivet.pluginNodeDefinition(impl, "Add Vector");
};
