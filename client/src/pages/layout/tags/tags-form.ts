import { FormTabSchema } from "../grid/form/form-schema";

const tagsForm: FormTabSchema[] = [
  {
    tabLabel: "Tag",
    tabId: "tag",
    sections: [
      {
        sectionLabel: "Tag Details",
        colType: 2,
        blocks: [
          {
            fields: [
              {
                name: "name",
                label: "Tag Name",
                type: "text",
                placeholder: "Enter tag name",
                validation: { required: true },
              },
              {
                name: "color",
                label: "Tag Color",
                type: "color",
                validation: { required: true },
              },
              {
                name: "description",
                label: "Tag Description",
                type: "textarea",
                placeholder: "Describe this tag...",
                validation: { required: false },
              },
            ],
          },
        ],
      },
    ],
  },
];

export default tagsForm;
