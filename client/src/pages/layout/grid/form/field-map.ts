import BooleanComponent from "../../../../shared/controls/boolean";
import CheckboxComponent from "../../../../shared/controls/checkbox";
import DateComponent from "../../../../shared/controls/date";
import DropdownComponent from "../../../../shared/controls/dropdown";
import EditorComponent from "../../../../shared/controls/editor";
import EmailComponent from "../../../../shared/controls/email";
import FileComponent from "../../../../shared/controls/file";
import PasswordComponent from "../../../../shared/controls/password";
import PhoneComponent from "../../../../shared/controls/phone";
import RadioComponent from "../../../../shared/controls/radio";
import TextComponent from "../../../../shared/controls/text";
import TextareaComponent from "../../../../shared/controls/textarea";
import ColorComponent from "../../../../shared/controls/color";
import RatingComponent from "../../../../shared/controls/rating";
import NumberComponent from "../../../../shared/controls/number";
import ChipComponent from "../../../../shared/controls/chip";
import EmailSingleComponent from "../../../../shared/controls/email-single";
import ImageComponent from "../../../../shared/controls/image";

export const componentMap: Record<string, React.ComponentType<any>> = {
  text: TextComponent,
  textarea: TextareaComponent,
  boolean: BooleanComponent,
  dropdown: DropdownComponent,
  email: EmailComponent,
  emailsingle: EmailSingleComponent,
  radio: RadioComponent,
  checkbox: CheckboxComponent,
  password: PasswordComponent,
  file: FileComponent,
  date: DateComponent,
  html: EditorComponent,
  tel: PhoneComponent,
  color: ColorComponent,
  rating: RatingComponent,
  number: NumberComponent,
  chip: ChipComponent,
  image: ImageComponent,
};
