import { Request, Response } from "express";
import axios from "axios";

/**
 * @description Gets address from latitude and longitude using Geoapify API.
 */
export const getAdressfromLatLng = async (req: Request, res: Response) => {
  try {
    const { latitude, longitude } = req.body;
    if (!latitude || !longitude) {
      return res.status(400).json({ message: "Latitude and longitude are required." });
    }

    if (typeof latitude != "number" || typeof longitude != "number") {
      return res.status(400).json({ message: "Latitude and longitude must be a number " });
    }

    const apiKey = process.env.GEOAPIFY_ACCESS_KEY;
    const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${apiKey}`;
    const thirdPartyresponse = await axios.get<any>(url);
    const { datasource, ...response } = thirdPartyresponse.data?.features?.[0]?.properties ?? {};
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

/**
 * @description Gets State list from data.gov.in API.
 */

export const getStateList = async (req: Request, res: Response) => {
  try {
    const countryCode = "IN";
    const api_key = process.env.DATA_CSC_API_KEY;
    const url = `https://api.countrystatecity.in/v1/countries/${countryCode}/states`;
    const thirdPartyresponse = await axios.get<any>(url, {
      headers: { "X-CSCAPI-KEY": api_key || "" },
    });
    return res.status(200).json(thirdPartyresponse.data);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const validatePincode = async (req: Request, res: Response) => {
  try {
    const { pincode, state } = req.body;
    if (!pincode) {
      return res.status(400).json({ message: "Pincode is required." });
    }
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    if (!pincodeRegex.test(pincode)) {
      return res.status(400).json({ message: "Invalid pincode format." });
    }

    if (!state || typeof state !== "string") {
      return res.status(400).json({ message: "State Name is required for pincode validation." });
    }

    const url = `https://api.postalpincode.in/pincode/${pincode}`;
    const thirdPartyresponse = await axios.get<any>(url);
    if (thirdPartyresponse.data[0].Status === "Success") {
      const postOffices = thirdPartyresponse.data[0].PostOffice;
      const stateMatched = postOffices.some((office: any) => office.State.toLowerCase() === state.toLowerCase());
      if (!stateMatched) {
        return res.status(400).json({ message: "Pincode does not match the provided state." });
      }
      return res.status(200).json(thirdPartyresponse.data[0].PostOffice);
    } else {
      return res.status(404).json({ message: "Pincode not found." });
    }
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const getCityList = async (req: Request, res: Response) => {
  try {
    const stateCode = req.params.stateCode;
    if (!stateCode) {
      return res.status(400).json({ message: "State code is required." });
    }
    const countryCode = "IN";
    const api_key = process.env.DATA_CSC_API_KEY;
    const url = `https://api.countrystatecity.in/v1/countries/${countryCode}/states/${stateCode}/cities`;
    const thirdPartyresponse = await axios.get<any>(url, {
      headers: { "X-CSCAPI-KEY": api_key || "" },
    });
    return res.status(200).json(thirdPartyresponse.data);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};
