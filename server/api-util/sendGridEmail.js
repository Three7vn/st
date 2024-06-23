const sgMail = require('@sendgrid/mail');

const {
  SENDGRID_API_KEY,
  SEND_GRID_PAYOUT_EMAIL,
  SEND_GRID_NEW_ITEM,
  SEND_GRID_ADMIN_EMAIL,
  SEND_GRID_PRICE_DROP,
  SEND_GRID_USER_FOLLOWER,
  SEND_GRID_DELETE_ACCOUNT,
  SEND_GRID_CART_ITEM_NOTIFY,
  SEND_GRID_SAVE_ITEM_NOTIFY,
  SEND_GRID_OUT_FOR_DELIVERY_NOTIFY,
  SEND_GRID_ORDER_DISPATCHED_NOTIFY,
  SEND_GRID_DISPUTE_ORDER_NOTIFY,
  SEND_GRID_DISPUTE_RESOLVED_NOTIFY_TO_SELLER,
  SEND_GRID_DISPUTE_RESOLVED_NOTIFY_TO_BUYER,
  SEND_GRID_EMAIL,
  SEND_GRID_REPORT_USER_NOTIFY,
  SEND_GRID_POINTS_EXPIRING,
  SEND_GRID_OFF_PLATFORM_REWARDS_USER,
  SEND_GRID_OFF_PLATFORM_REWARDS_ADMIN,
  SEND_GRID_EARNED_POINTS,
  SEND_GRID_PLATFORM_REWARDS_USER
} = process.env;


exports.disputeOrderNotify = async value => {
  
  try {
    const transactionId = value?.transactionId;
    const textBox = value?.textBox
    const buyerUserId = value?.buyerUserId
    const sellerUserId = value?.sellerUserId
    const key = process.env.SENDGRID_API_KEY;
    sgMail.setApiKey(key);

    const message = {
      from: process.env.SEND_GRID_ADMIN_EMAIL,
      to: SEND_GRID_EMAIL,
      subject: 'Dispute order',
      templateId: process.env.SEND_GRID_DISPUTE_ORDER_NOTIFY,
      dynamicTemplateData: {transactionId,textBox,buyerUserId,sellerUserId}
    };

    const response = await sgMail.send(message);
    return response;
  } catch (error) {
    console.log(error, '$$$$ $$$$ => error');
  }
};
exports.reportUserNotify = async value => {  
  try {
    const reporterUserId= value?.reporterUserId
    const listingId= value?.listingId
    const textBox= value?.textBox
    const reporterUserName= value?.reporterUserName
    const reportedUserName= value?.reportedUserName
    const sellerUserId=value?.sellerUserId
    const key = process.env.SENDGRID_API_KEY;
    sgMail.setApiKey(key);

    const message = {
      from: process.env.SEND_GRID_ADMIN_EMAIL,
      to: SEND_GRID_EMAIL,
      subject: 'Report User',
      templateId: process.env.SEND_GRID_REPORT_USER_NOTIFY,
      dynamicTemplateData: {reporterUserId,listingId,textBox,reporterUserName,reportedUserName,sellerUserId}
    };

    const response = await sgMail.send(message);
    return response;
  } catch (error) {
    console.log(error, '$$$$ $$$$ => error');
  }
};
exports.offPlatformUserNotify = async value => {  
  try {
    const username= value?.userName
    const imageUrl = value?.image
    const key = SENDGRID_API_KEY;
    sgMail.setApiKey(key);
    const message = {
      from: SEND_GRID_ADMIN_EMAIL,
      to: SEND_GRID_EMAIL,
      subject: 'Off platform rewards user',
      templateId: SEND_GRID_OFF_PLATFORM_REWARDS_USER,
      dynamicTemplateData: {username,imageUrl}
    };

    const response = await sgMail.send(message);
    return response;
  } catch (error) {
    console.log(error, '$$$$ $$$$ => error');
  }
};

exports.offPlatformAdminNotify = async value => {  
  try {
    
    const UserID= value?.userId
    const RewardID = value?.reward
    const key = SENDGRID_API_KEY;
    sgMail.setApiKey(key);
    const message = {
      from: SEND_GRID_ADMIN_EMAIL,
      to: SEND_GRID_EMAIL,
      subject: 'Off platform rewards admin',
      templateId: SEND_GRID_OFF_PLATFORM_REWARDS_ADMIN,
      dynamicTemplateData: {RewardID,UserID}
    };

    const response = await sgMail.send(message);
    return response;
  } catch (error) {
    console.log(error, '$$$$ $$$$ => error');
  }
};

exports.platformAdminNotify = async value => {  
  try {
    
    const UserName= value?.userName
    const imageUrl = value?.image
    const key = SENDGRID_API_KEY;
    sgMail.setApiKey(key);
    const message = {
      from: SEND_GRID_ADMIN_EMAIL,
      to: SEND_GRID_EMAIL,
      subject: 'platform rewards admin',
      templateId: SEND_GRID_PLATFORM_REWARDS_USER,
      dynamicTemplateData: {UserName,imageUrl}
    };

    const response = await sgMail.send(message);
    return response;
  } catch (error) {
    console.log(error, '$$$$ $$$$ => error');
  }
};

exports.earnedPointsNotify = async value => {  
  try {
    
    const UserName= value?.userName
    const PointsEarned = value?.pointsValue
    const key = SENDGRID_API_KEY;
    sgMail.setApiKey(key);
    const message = {
      from: SEND_GRID_ADMIN_EMAIL,
      to: SEND_GRID_EMAIL,
      subject: 'Earned Points',
      templateId: SEND_GRID_EARNED_POINTS,
      dynamicTemplateData: {UserName,PointsEarned}
    };

    const response = await sgMail.send(message);
    return response;
  } catch (error) {
    console.log(error, '$$$$ $$$$ => error');
  }
};