// **** IMPORTANT ****
// Make sure you do `import type` and do not pull in the entire Rivet core library here.
// Export a function that takes in a Rivet object, and you can access rivet library functionality
// from there.
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

import { SentenceTransformer } from "@tuesdaycrowd/sentence-transformers/src/model";

// This defines your new type of node.
export type SentenceTransformerPluginNode = ChartNode<
  "SentenceTransformerPlugin",
  SentenceTransformerPluginNodeData
>;

// This defines the data that your new node will store.
export type SentenceTransformerPluginNodeData = {
  embeddings: number[][];
  strArray: string[];
  useStrArrayInput?: boolean;
};

// Make sure you export functions that take in the Rivet library, so that you do not
// import the entire Rivet core library in your plugin.
export function SentenceTransformerPluginNode(rivet: typeof Rivet) {
  // This is your main node implementation. It is an object that implements the PluginNodeImpl interface.
  const SentenceTransformerPluginNodeImpl: PluginNodeImpl<SentenceTransformerPluginNode> =
  {
    // This should create a new instance of your node type from scratch.
    create(): SentenceTransformerPluginNode {
      const node: SentenceTransformerPluginNode = {
        // Use rivet.newId to generate new IDs for your nodes.
        id: rivet.newId<NodeId>(),

        // This is the default data that your node will store
        data: {
          embeddings: [],
          strArray: [],
          useStrArrayInput: false,
        },

        // This is the default title of your node.
        title: "Sentence-Transformer Plugin Node",

        // This must match the type of your node.
        type: "SentenceTransformerPlugin",

        // X and Y should be set to 0. Width should be set to a reasonable number so there is no overflow.
        visualData: {
          x: 0,
          y: 0,
          width: 200,
        },
      };
      return node;
    },

    // This function should return all input ports for your node, given its data, connections, all other nodes, and the project. The
    // connection, nodes, and project are for advanced use-cases and can usually be ignored.
    getInputDefinitions(
      data: SentenceTransformerPluginNodeData,
      _connections: NodeConnection[],
      _nodes: Record<NodeId, ChartNode>,
      _project: Project,
    ): NodeInputDefinition[] {
      const inputs: NodeInputDefinition[] = [];

      if (data.useStrArrayInput) {
        inputs.push({
          id: "strArray" as PortId,
          dataType: "string[]",
          title: "Paths",
        });
      }

      return inputs;
    },

    // This function should return all output ports for your node, given its data, connections, all other nodes, and the project. The
    // connection, nodes, and project are for advanced use-cases and can usually be ignored.
    getOutputDefinitions(
      _data: SentenceTransformerPluginNodeData,
      _connections: NodeConnection[],
      _nodes: Record<NodeId, ChartNode>,
      _project: Project,
    ): NodeOutputDefinition[] {
      return [
        {
          id: "embeddings" as PortId,
          dataType: "vector[]",
          title: "Embeddings",
        },
      ];
    },

    // This returns UI information for your node, such as how it appears in the context menu.
    getUIData(): NodeUIData {
      return {
        contextMenuTitle: "Sentence-Transformer Plugin",
        group: "Data",
        infoBoxBody: "This is a sentence-transformer plugin node.",
        infoBoxTitle: "Sentence-Transformer Plugin Node",
      };
    },

    // This function defines all editors that appear when you edit your node.
    getEditors(
      _data: SentenceTransformerPluginNodeData,
    ): EditorDefinition<SentenceTransformerPluginNode>[] {
      return [
        {
          type: "stringList",
          dataKey: "strArray",
          useInputToggleDataKey: "useStrArrayInput",
          label: "String List",
        },
      ];
    },

    // This function returns the body of the node when it is rendered on the graph. You should show
    // what the current data of the node is in some way that is useful at a glance.
    getBody(
      data: SentenceTransformerPluginNodeData,
    ): string | NodeBodySpec | NodeBodySpec[] | undefined {
      return rivet.dedent`
        Sentence-Transformer Plugin Node
      `;
    },

    // This is the main processing function for your node. It can do whatever you like, but it must return
    // a valid Outputs object, which is a map of port IDs to DataValue objects. The return value of this function
    // must also correspond to the output definitions you defined in the getOutputDefinitions function.
    async process(
      data: SentenceTransformerPluginNodeData,
      inputData: Inputs,
      _context: InternalProcessContext,
    ): Promise<Outputs> {
      const strArray = rivet.getInputOrData(
        data,
        inputData,
        "strArray",
        "string[]",
      );

      const sentenceTransformer = await SentenceTransformer.from_pretrained(
        "mixedbread-ai/mxbai-embed-large-v1",
      );
      const embeddings = await sentenceTransformer.encode(strArray);
      return {
        ["embeddings" as PortId]: {
          type: "vector[]",
          value: embeddings,
        },
      };
    },
  };

  // Once a node is defined, you must pass it to rivet.pluginNodeDefinition, which will return a valid
  // PluginNodeDefinition object.
  const SentenceTransformerPluginNode = rivet.pluginNodeDefinition(
    SentenceTransformerPluginNodeImpl,
    "Sentence-Transformer Plugin Node",
  );

  // This definition should then be used in the `register` function of your plugin definition.
  return SentenceTransformerPluginNode;
}
