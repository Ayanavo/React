import moment from "moment";

export default [
  {
    tabLabel: "Account",
    tabId: "account",
    sections: [
      {
        sectionLabel: "Account Details",
        colType: 2,
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
                name: "password",
                label: "Password",
                type: "password",
                validation: { required: true, minLength: 8 },
              },
              {
                name: "email",
                label: "Email",
                type: "email",
                validation: { required: true, email: true },
              },
              {
                name: "phone",
                label: "Phone",
                type: "tel",
                validation: { required: true, pattern: "^\\d{10}$" },
              },
              {
                name: "description",
                label: "Description",
                placeholder: "Enter your message here...",
                type: "textarea",
                validation: { required: false },
              },
              {
                name: "gender",
                label: "Gender",
                type: "radio",
                options: [
                  { label: "Male", value: "male" },
                  { label: "Female", value: "female" },
                  { label: "Other", value: "other" },
                ],
                validation: { required: true },
              },
            ],
          },
        ],
      },
      {
        sectionLabel: "Leave a Recommendation",
        colType: 1,
        blocks: [
          {
            fields: [
              {
                name: "comments",
                label: "Comments",
                placeholder: "Enter your message here...",
                type: "html",
                validation: { required: false },
              },
              {
                name: "terms",
                label: "I agree to the terms and conditions",
                type: "boolean",
                default: false,
                validation: { required: true },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    tabLabel: "Address",
    tabId: "address",
    sections: [
      {
        sectionLabel: "Address Details",
        colType: 1,
        blocks: [
          {
            fields: [
              {
                name: "street",
                label: "Street",
                type: "text",
                validation: { required: true },
              },
              {
                name: "city",
                label: "City",
                type: "text",
                validation: { required: true },
              },
              {
                name: "state",
                label: "State",
                type: "text",
                validation: { required: true },
              },
              {
                name: "zip",
                label: "Zip",
                type: "text",
                validation: {
                  required: true,
                  pattern: "^\\d{5}(?:[-\\s]\\d{4})?$",
                },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    tabLabel: "Payment",
    tabId: "payment",
    sections: [
      {
        sectionLabel: "Payment Details",
        colType: 1,
        blocks: [
          {
            fields: [
              {
                name: "cardHolderName",
                label: "Card Holder Name",
                type: "text",
                validation: { required: true },
              },
              {
                name: "cardNumber",
                label: "Card Number",
                type: "text",
                validation: {
                  required: true,
                  pattern:
                    "^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{2}(?:[0-9]{2})?|6(?:011|5[0-9][0-9])[0-9]{2}(?:[0-9]{3})?|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9]|9[0-9])[0-9]{12}|2(?:13[1-9]|1[4-9][0-9]|20[0-1][0]-|20[2-8][0-9]|29[01][0-9]|2929)[0-9]{12}|7[0-9]{13,15}|3(?:0[0-6]|[68][0-9]|9[0-1])[0-9]{11}$",
                },
                placeholder: "Enter your credit card number...",
              },
              {
                name: "expiryDate",
                label: "Expiry Date",
                type: "date",
                validation: {
                  required: true,
                  pattern: "^(0[1-9]|1[0-2])/(?:0[1-9]|1\\d|2[0-9]|3[01])$",
                },
                default: new Date(moment("15.11.1999", "DD.MM.YYYY").format()),
                placeholder: "DD.MM.YYYY",
              },
              {
                name: "ifce",
                label: "IFCE",
                type: "number",
                validation: {
                  required: true,
                  pattern: "^\\d{3}$",
                },
                default: 0,
                placeholder: "XXX",
              },
            ],
          },
        ],
      },
      {
        sectionLabel: "Payment Method",
        colType: 1,
        blocks: [
          {
            fields: [
              {
                name: "paymentMethod",
                label: "Payment Method",
                type: "dropdown",
                options: [
                  { label: "Credit Card", value: "creditCard" },
                  { label: "PayPal", value: "paypal" },
                  { label: "Bank Transfer", value: "bankTransfer" },
                ],
                validation: { required: true },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    tabLabel: "Miscellaneous",
    tabId: "miscellaneous",
    sections: [
      {
        sectionLabel: "miscellaneous",
        colType: 1,
        blocks: [
          {
            fields: [
              {
                name: "color",
                label: "Pick a color",
                type: "color",
                validation: { required: true },
              },
              {
                name: "rate",
                label: "Give a rate",
                iconType: "StarIcon",
                maxRating: 5,
                type: "rating",
                validation: { required: true },
              },
            ],
          },
          {
            fields: [
              {
                name: "upload",
                label: "Attachments",
                type: "file",
                default: [],
                validation: { required: true, maxSize: "32Kb", multiple: true },
              },
            ],
          },
        ],
      },
    ],
  },
];
