import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import DropdownComponent from "@/shared/controls/dropdown";
import TextComponent from "@/shared/controls/text";
import { getStateListAPI } from "@/shared/services/profile";
import { Loader2, MapPin } from "lucide-react";
import React, { useEffect, useState } from "react";
import { FieldValue } from "react-hook-form";
import { getCurrentLocationAPI } from "../services/profile";
import { Bar } from "@/components/ui/bar";
import showToast from "@/hooks/toast";
import { validatePincodeAPI } from "@/shared/services/profile";

type AddressSchema = {
  name: string;
  label: string;
  validation: { required: boolean };
};

function address({ form, schema }: { form: FieldValue<any>; schema: AddressSchema }) {
  const addressConfig = {
    addressLine1: {
      label: "Flat, House no., Building, Company, Apartment",
      visible: true,
      type: "text",
      validation: { required: true },
    },
    addressLine2: {
      label: "Area, Street, Sector, Village",
      visible: true,
      type: "text",
      validation: { required: false },
    },
    landmark: {
      label: "Landmark",
      visible: true,
      type: "text",
      validation: { required: false },
    },
    city: {
      label: "Town/City",
      visible: true,
      type: "text",
      validation: { required: true },
    },
    state: {
      label: "State",
      visible: true,
      type: "list",
      validation: { required: true },
      options: [],
    },
    pincode: {
      label: "Pincode",
      visible: true,
      type: "text",
      validation: { required: true },
    },
  } as const;
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isLoadingState, setIsLoadingState] = useState(false);
  const [stateList, setStateList] = useState<Array<{ label: string; value: string }>>([]);

  useEffect(() => {
    setIsLoadingState(true);
    fethStateList();
  }, []);

  const validatePincode = async (pincode: string, state: string): Promise<Array<any>> => {
    if (pincode && state) {
      const response = await validatePincodeAPI({ pincode, state });
      return response?.data ?? [];
    }
    return [];
  };

  const fethStateList = async () => {
    getStateListAPI()
      .then((response) => {
        if (response && response.data) {
          console.log("State List API response:", response.data);

          setStateList(response.data.map((state) => ({ label: state.name, value: state.name })));
        } else {
          console.error("Invalid response structure:", response);
        }
      })
      .finally(() => {
        setIsLoadingState(false);
      });
  };
  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      showToast({ title: "Geolocation is not supported by this browser.", variant: "error" });
      return;
    }

    setIsLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await getCurrentLocationAPI({ latitude, longitude });
          console.log("Location API response:", response.data);
        } catch (error) {
          console.error("Error calling getCurrentLocationAPI:", error);
        }

        setIsLoadingLocation(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Unable to retrieve your location. Please check your browser permissions.");
        setIsLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };
  if (isLoadingState) {
    return <Bar className="w-full h-0.5" />;
  }
  return (
    <div className="space-y-4">
      <h2 className="font-medium">{schema.label}</h2>
      <Separator />
      <Button type="button" variant="outline" size="sm" onClick={getCurrentLocation} disabled={isLoadingLocation} className="w-full sm:w-auto bg-transparent">
        {isLoadingLocation ?
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Getting location...
          </>
        : <>
            <MapPin className="w-4 h-4 mr-2" />
            Use Current Location
          </>
        }
      </Button>

      {/* Address Line 1 */}
      {addressConfig.addressLine1.validation && (
        <TextComponent
          form={form}
          schema={{
            name: "addressLine1",
            label: addressConfig.addressLine1.label,
            placeholder: "",
            type: addressConfig.addressLine1.type,
            validation: {
              required: addressConfig.addressLine1.validation.required,
            },
          }}
        />
      )}

      {/* Address Line 2 */}
      {addressConfig.addressLine2.validation && (
        <TextComponent
          form={form}
          schema={{
            name: "addressLine2",
            label: addressConfig.addressLine2.label,
            placeholder: "",
            type: addressConfig.addressLine2.type,
            validation: {
              required: addressConfig.addressLine2.validation.required,
            },
          }}
        />
      )}

      {/* Landmark */}
      {addressConfig.landmark.validation && (
        <TextComponent
          form={form}
          schema={{
            name: "landmark",
            label: addressConfig.landmark.label,
            placeholder: "",
            type: addressConfig.landmark.type,
            validation: {
              required: addressConfig.landmark.validation.required,
            },
          }}
        />
      )}

      {/* City */}
      {addressConfig.city.validation && (
        <TextComponent
          form={form}
          schema={{
            name: "city",
            label: addressConfig.city.label,
            placeholder: "",
            type: addressConfig.city.type,
            validation: {
              required: addressConfig.city.validation.required,
            },
          }}
        />
      )}

      {/* State */}
      {addressConfig.state.validation && (
        <DropdownComponent
          form={form}
          schema={{
            name: "state",
            label: addressConfig.state.label,
            placeholder: "",
            options: stateList,
            type: addressConfig.state.type,
            validation: {
              required: addressConfig.state.validation.required,
            },
          }}
        />
      )}

      {/* Pincode */}
      {addressConfig.pincode.validation && (
        <TextComponent
          form={form}
          schema={{
            name: "pincode",
            label: addressConfig.pincode.label,
            placeholder: "",
            type: addressConfig.pincode.type,
            validation: {
              required: addressConfig.pincode.validation.required,
              asyncValidator: async (value: string) => await validatePincode(value, form.getValues("state")),
            },
          }}
        />
      )}
    </div>
  );
}

export default address;
