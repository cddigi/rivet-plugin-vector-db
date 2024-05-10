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

import { create, search, insert } from "@orama/orama";

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
      if (data.useMetadataInput) {
        inputs.push({
          id: "metadata" as PortId,
          dataType: "object",
          title: "Metadata",
          description:
            "Metadata to attach to the item. Must be an object with string values.",
        });
      }

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

    async process(data, inputData, _context): Promise<Outputs> {
      const id = rivet.getInputOrData(data, inputData, "id", "string");

      const embedding = rivet.getInputOrData(
        data,
        inputData,
        "embedding",
        "vector",
      );

      const metadata = rivet.getInputOrData(
        data,
        inputData,
        "metadata",
        "any[]",
      );

      const vdb = create({
        schema: {
          name: "string",
          body: "string",
          embedding: "vector[768]",
        } as const,
      });

      // await insert(vdb, {
      //   name: id,
      //   body: "hello world",
      //   embedding: embedding,
      // });

      // const searchResult = await search(vdb, {
      //   term: "earth",
      // });

      return {
        ["id" as PortId]: {
          type: "string",
          value: id,
        },
      };
    },
  };

  return rivet.pluginNodeDefinition(impl, "Add Vector");
};
