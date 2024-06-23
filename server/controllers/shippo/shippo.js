const axios = require('axios');
const { SHIPPO_URL, SHIPPO_API_KEY, ADMIN_NAME, ADMIN_STREET_ADDRESS, ADMIN_CITY, ADMIN_STATE, ADMIN_POSTAL_CODE } = process.env;
// const shippo = require('shippo')(SHIPPO_API_KEY);

module.exports = {
  getCarrierAccounts: async (req, res) => {
    try {
      const carrierAccounts = await axios.get(`${SHIPPO_URL}carrier_accounts/`, {
        headers: {
          Authorization: `ShippoToken ${SHIPPO_API_KEY}`,
        },
      });
      res.status(200).json(carrierAccounts?.data);
    } catch (error) {
      console.error('Error listing carrier accounts:', error);
      res.status(500).json({ error: 'Error listing carrier accounts' });
    }
  },

  validateUserAddress: async (req, res) => {
    const { userName, city, state, postalCode, address_line_1 } = req.body;
    try {
      const url = `${SHIPPO_URL}v2/addresses/validate`;
      const params = {
        name: userName?.name,
        address_line_1: address_line_1,
        address_line_2: '',
        city_locality: city,
        state_province: state,
        postal_code: postalCode,
        country_code: 'GB',
      };
      const headers = {
        Authorization: `ShippoToken ${SHIPPO_API_KEY}`,
      };

      const response = await axios.get(url, { params, headers });
      return res.status(201).json(response.data);
    } catch (error) {
      console.error(error.response.data.detail);
      return res.status(200).json(error.response.data.detail);
    }
  },

  getShippingRates: async (req, res) => {
    const {
      buyerShippingAddress,
      sellerShippingAddress,
      listingDimensions,
      carrier_object_id,
    } = req.body;

    try {
      const shipmentData = {
        address_from: { ...sellerShippingAddress },
        address_to: { ...buyerShippingAddress },
        parcels: [
          {
            distance_unit: 'cm',
            mass_unit: 'kg',
            ...listingDimensions,
          },
        ],
        async: false,
      };

      const url1 = `${SHIPPO_URL}shipments`;
      const headers1 = {
        Authorization: `ShippoToken ${SHIPPO_API_KEY}`,
      };

      const shipment = await axios.post(
        url1,
        { ...shipmentData, carrier_accounts: [carrier_object_id] },
        {
          headers: headers1,
        }
      );
      // if (shipment?.data?.rates?.length === 0) {
      //   const shipment2 = await axios.post(url1, shipmentData, {
      //     headers: headers1,
      //   });
      //   return res.status(201).json(shipment2.data);
      // } else {
      return res.status(201).json(shipment.data);
      // }
    } catch (error) {
      console.error(error);
      return res.status(500).json(error);
    }
  },

  createShippingLabel: async (req, res) => {
    const { email, userName, isVerify, buyerAddress, address_line_1, city, postalCode, state, sellerUserName, sellerEmail, serviceToken, carrier_account, height, width, weight, length } = req.body;

    try {
      const shipmentData = {
        shipment: {
          address_from: {
            name: sellerUserName,
            street1: address_line_1,
            city,
            state,
            zip: postalCode,
            country: "GB",
            email: sellerEmail
          },
          address_to: isVerify ? {
            name: ADMIN_NAME,
            street1: ADMIN_STREET_ADDRESS,
            city: ADMIN_CITY,
            state: ADMIN_STATE,
            zip: ADMIN_POSTAL_CODE,
            country: "GB",
          } : {
            name: userName,
            street1: buyerAddress?.address_line_1,
            city: buyerAddress?.city,
            state: buyerAddress?.state,
            zip: buyerAddress?.postalCode,
            country: "GB",
            email,
          },
          parcels: [{
            length,
            width,
            height,
            distance_unit: "cm",
            weight,
            mass_unit: "kg",
          }],

        },
        carrier_account,
        servicelevel_token: serviceToken,

      };
      const url = `${SHIPPO_URL}transactions`;
      const headers = {
        Authorization: `ShippoToken ${SHIPPO_API_KEY}`,
        'Content-Type': 'application/json',
      };

      const labelResponse = await axios.post(url, shipmentData, { headers });
      return res.status(201).json(labelResponse.data);
    } catch (error) {
      console.error('Error creating shipping label:', error.response ? error.response.data : error.message);
      return res.status(500).json({ error: 'Failed to create shipping label', details: error.response ? error.response.data : error.message });
    }
  },

  createReturnShippingLabel: async (req, res) => {
    const { email, userName, buyerAddress, serviceToken, carrier_account, height, width, weight, length } = req.body;

    try {
      const shipmentData = {
        shipment: {
          address_from: {
            name: userName,
            street1: buyerAddress?.address_line_1,
            city: buyerAddress?.city,
            state: buyerAddress?.state,
            zip: buyerAddress?.postalCode,
            country: "GB",
            email,
          },
          address_to: {
            name: ADMIN_NAME,
            street1: ADMIN_STREET_ADDRESS,
            city: ADMIN_CITY,
            state: ADMIN_STATE,
            zip: ADMIN_POSTAL_CODE,
            country: "GB",
          },
          parcels: [{
            length,
            width,
            height,
            distance_unit: "cm",
            weight,
            mass_unit: "kg",
          }],

        },
        carrier_account,
        servicelevel_token: serviceToken,

      };
      const url = `${SHIPPO_URL}transactions`;
      const headers = {
        Authorization: `ShippoToken ${SHIPPO_API_KEY}`,
        'Content-Type': 'application/json',
      };

      const labelResponse = await axios.post(url, shipmentData, { headers });
      return res.status(201).json(labelResponse.data);
    } catch (error) {
      console.error('Error creating shipping label:', error.response ? error.response.data : error.message);
      return res.status(500).json({ error: 'Failed to create shipping label', details: error.response ? error.response.data : error.message });
    }
  },

  // trackingOrder: async (req, res) => {
  //   const { tracking_number, tracking_status } = req.body;

  //   try {
  //     const url = `${SHIPPO_URL}/tracks/${shippo}/${tracking_number}`;

  //     const response = await axios.get(url, {
  //       headers: {
  //         Authorization: `ShippoToken ${SHIPPO_API_KEY}`,
  //       },
  //     });

  //     return res.status(201).json(response.data);
  //   } catch (error) {
  //     console.error(error);
  //     return res.status(500).json({ message: 'Internal Server Error' });
  //   }
  // },

};
