// src/nodes/AddVectorNode.ts
var addVectorNode = (rivet) => {
  const impl = {
    create() {
      const node = {
        id: rivet.newId(),
        data: {
          id: "",
          embedding: [],
          metadata: []
        },
        title: "Add Vector Embedding Node",
        type: "addVector",
        visualData: {
          x: 0,
          y: 0,
          width: 200
        }
      };
      return node;
    },
    getInputDefinitions(data) {
      const inputs = [];
      inputs.push({
        id: "id",
        dataType: "string",
        title: "ID"
      });
      inputs.push({
        id: "embedding",
        dataType: "vector",
        title: "Embedding"
      });
      inputs.push({
        id: "metadata",
        dataType: "any[]",
        title: "Metadata"
      });
      return inputs;
    },
    getOutputDefinitions() {
      return [
        {
          id: "id",
          dataType: "string",
          title: "ID"
        }
      ];
    },
    getUIData() {
      return {
        contextMenuTitle: "Add Vector",
        group: "Vector DB",
        infoBoxBody: "This is a node for adding text to the in-memory vector database.",
        infoBoxTitle: "Add Vector Node"
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
          valuePlaceholder: "Value"
        }
      ];
    },
    getBody(data) {
      return rivet.dedent`
        Add Vector Node
        ID: ${data.id ? "(Using Input)" : data.id}
        Metadata: ${data.metadata ? "(Using Input)" : data.metadata}
      `;
    },
    async process(data, inputData, context) {
      const someData = rivet.getInputOrData(data, inputData, "id", "string");
      return {
        ["someData"]: {
          type: "string",
          value: someData
        }
      };
    }
  };
  return rivet.pluginNodeDefinition(impl, "Add Vector");
};

// src/index.ts
var plugin = (rivet) => {
  const addVector = addVectorNode(rivet);
  const addVectorPlugin = {
    id: "vector-db-plugin",
    name: "Vector Database Plugin",
    configSpec: {},
    contextMenuGroups: [
      {
        id: "vector-db-plugin",
        label: "Vector DB"
      }
    ],
    register: (register) => {
      register(addVector);
    }
  };
  return addVectorPlugin;
};
var src_default = plugin;
export {
  src_default as default
};
