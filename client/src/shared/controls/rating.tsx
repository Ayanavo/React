import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import React from "react";
import IconComponent from "../../common/icons";
import { FieldValue } from "react-hook-form";

type RatingSchema = {
  name: string;
  label: string;
  placeholder: string;
  type: "rating";
  iconType: string;
  maxRating: number;
  validation: { required: boolean };
};

function rating({ form, schema }: { form: FieldValue<any>; schema: RatingSchema }) {
  const [hoveredRating, setHoveredRating] = React.useState(0);
  const [isAnimating, setIsAnimating] = React.useState(false);

  const handleRatingChange = (newRating: number) => {
    form.setValue(schema.name, newRating);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
  };
  return (
    <FormField
      control={form.control}
      name={schema.name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {schema.label} {schema.validation.required && <span className="text-destructive">*</span>}
          </FormLabel>
          <FormControl>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1" role="radiogroup">
                {[...Array(schema.maxRating)].map((_, index) => {
                  const starValue = index + 1;
                  return (
                    <Button
                      key={starValue}
                      variant="ghost"
                      type="button"
                      size="sm"
                      className={cn(
                        "p-0 hover:bg-transparent transition-all duration-300",
                        hoveredRating === starValue && "scale-110",
                        isAnimating && field.value >= starValue && "scale-125"
                      )}
                      onMouseEnter={() => setHoveredRating(starValue)}
                      onMouseLeave={() => setHoveredRating(0)}
                      onClick={() => handleRatingChange(starValue)}
                      aria-checked={field.value >= starValue}
                      role="radio">
                      <IconComponent
                        icon={schema.iconType || "StarFilledIcon"}
                        customClass={cn(
                          "h-6 w-6 transition-colors duration-300",
                          hoveredRating >= starValue || field.value >= starValue ? "text-primary fill-primary" : "text-gray-300 fill-gray-300"
                        )}
                      />
                      <span className="sr-only">{`Rate ${starValue} out of ${schema.maxRating} stars`}</span>
                    </Button>
                  );
                })}
              </div>
              <span className="text-sm text-muted-foreground">
                {field.value} of {schema.maxRating} stars
              </span>
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  );
}

export default rating;
