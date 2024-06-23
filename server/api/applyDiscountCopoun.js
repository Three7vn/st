const moment = require('moment');
const { getIntegrationSdk } = require('../api-util/sdk');
const isdk = getIntegrationSdk();

const inValidResponse = "discount code is not valid";

const applyDiscountCopoun = (req, res) => {
    try {
        const { id, discountCode } = req.body;
       
        return isdk.users.show({ id: id })
            .then(response => {
                const { discounts } = response.data.data.attributes.profile.privateData;
                const todayDate = moment().unix();
                const getDiscountIndex = discounts && discounts.length ? discounts.findIndex((st) => st.discountCode == discountCode && st.durationEndDate > todayDate && st.durationStartDate < todayDate) : -1;
                if (getDiscountIndex >= 0) {
                    const { discountCode, percent , cashOffOrder } = discounts[getDiscountIndex] || {};
                    return res
                        .status(200)
                        .set('Content-Type', 'application/transit+json')
                        .send({ data: "VALID", message: "discount code is valid", discountCode, discount:{price: cashOffOrder, percent} })
                        .end();

                } else {
                    return res.status(400).send(inValidResponse).end();
                 
                }
            }).catch(E => {
                console.log(E, '&&& &&& => E')
                return res.status(400).send(inValidResponse).end();
            }
            )
    } catch (e) {
        return res.status(400).send(inValidResponse).end();
    }
}

module.exports = { applyDiscountCopoun }