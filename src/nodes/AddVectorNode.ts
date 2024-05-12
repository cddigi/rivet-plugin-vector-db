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
    useIdInput?: boolean;
    embedding: number[];
    useEmbeddingInput?: boolean;
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
          embedding: [0, 1],
          metadata: [],
        },
        title: "Add Vector Embedding",
        type: "addVector",
        visualData: {
          x: 0,
          y: 0,
          width: 200,
        },
      };

      return node;
    },

    getInputDefinitions(
      data,
      _connections,
      _nodes,
      _project,
    ): NodeInputDefinition[] {
      const inputs: NodeInputDefinition[] = [];

      if (data.useIdInput) {
        inputs.push({
          id: "id" as PortId,
          dataType: "string",
          title: "ID",
          required: true,
        });
      }

      if (data.useEmbeddingInput) {
        inputs.push({
          id: "embedding" as PortId,
          dataType: "vector",
          title: "Embedding",
          // required: true,
          description: "The text embedding",
        });
      }

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

    getOutputDefinitions(
      _data,
      _connections,
      _nodes,
      _project,
    ): NodeOutputDefinition[] {
      return [
        {
          id: "id" as PortId,
          dataType: "string",
          title: "ID",
        },
        {
          id: "score" as PortId,
          dataType: "number",
          title: "Score",
        },
        {
          id: "embedding" as PortId,
          dataType: "vector",
          title: "Embedding",
        },
      ];
    },

    getUIData(_context): NodeUIData {
      return {
        contextMenuTitle: "Add Vector",
        group: "Vector DB",
        infoBoxBody:
          "This is a node for adding text to the in-memory vector database.",
        infoBoxTitle: "Add Vector Node",
      };
    },

    getEditors(_data): EditorDefinition<AddVectorNode>[] {
      return [
        {
          type: "string",
          dataKey: "id",
          label: "ID",
          useInputToggleDataKey: "useIdInput",
        },
        {
          type: "anyData",
          dataKey: "embedding",
          label: "Embedding",
          useInputToggleDataKey: "useEmbeddingInput",
        },
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

    getBody(
      data,
      _context,
    ): string | NodeBodySpec | NodeBodySpec[] | undefined {
      return rivet.dedent`
        Add Vector Node
        ID: ${data.id}
        Metadata: ${data.metadata ? "(Using Input)" : data.metadata}
        Vector: [${data.embedding}]
      `;
    },

    async process(data, inputData, _context): Promise<Outputs> {
      const embedding = rivet.getInputOrData(
        data,
        inputData,
        "embedding",
        "vector",
        "useEmbeddingInput",
      );

      const id = rivet.getInputOrData(
        data,
        inputData,
        "id",
        "string",
        "useIdInput",
      );

      // const metadata = rivet.getInputOrData(
      //   data,
      //   inputData,
      //   "metadata",
      //   "any[]",
      // );

      const vdb = await create({
        schema: {
          name: "string",
          body: "string",
          embedding: "vector[768]",
        } as const,
      });

      await insert(vdb, {
        name: id,
        body: "hello world",
        embedding: embedding,
      });

      const searchResult = await search(vdb, {
        term: "hello",
      });

      return {
        ["id" as PortId]: {
          type: "string",
          value: searchResult.hits[0].id,
        },
        ["score" as PortId]: {
          type: "number",
          value: searchResult.hits[0].score,
        },
        ["document" as PortId]: {
          type: "any",
          value: searchResult.hits[0].document,
        },
      };
    },
  };

  return rivet.pluginNodeDefinition(impl, "Add Vector");
};
