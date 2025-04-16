export default [
    {
        tabLabel: "Account",
        tabId: "account",
        sections: [
            {
                sectionLabel: "Account Details",
                colType: 1,
                blocks: [
                    {
                        fields: [
                            {
                                name: "name",
                                label: "Name",
                                type: "text",
                                validation: { required: true },
                            },
                            {
                                name: "description",
                                label: "Description",
                                placeholder: "Enter your message here...",
                                type: "textarea",
                                validation: { required: false },
                            }
                        ]
                    }
                ]
            }
        ]
    }
]