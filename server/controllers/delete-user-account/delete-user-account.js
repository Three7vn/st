const sgMail = require('@sendgrid/mail');
const { SENDGRID_API_KEY, SEND_GRID_ADMIN_EMAIL, SEND_GRID_DELETE_ACCOUNT_REQUEST } = process.env;

module.exports = async (req, res) => {
const {deleteReason,userId} = req.body ;
  try {
    const key = SENDGRID_API_KEY;
    sgMail.setApiKey(key);
    const message = {
      to: 'pooja@icodelabs.co',
      from: SEND_GRID_ADMIN_EMAIL,
      subject: 'Request to delete account',
      templateId: SEND_GRID_DELETE_ACCOUNT_REQUEST,
      dynamicTemplateData: {userId , textBox : deleteReason}
    };
    const result = await sgMail.send(message);
    res.status(200).send(result);
  } catch (error) {
    console.log(error?.response?.body?.errors, '$$$$ $$$$ => error');
  }
};
