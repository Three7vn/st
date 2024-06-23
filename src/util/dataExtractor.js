import phonesIcon from '../assets/categoryIcons/phones.png';
import computerIcon from '../assets/categoryIcons/computer.png';
import tvIcon from '../assets/categoryIcons/tv.png';
import headPhonesIcon from '../assets/categoryIcons/headPhones.png';
import watchesIcon from '../assets/categoryIcons/watches.png';
import clothingIcon from '../assets/categoryIcons/clothing1.png';
import {
  FREE_PLAN_COUNT_LIMIT,
  FREE_PLAN_PRICE_LIMIT,
  MEMBER_PLAN_COUNT_LIMIT,
  MEMBER_PLAN_PRICE_LIMIT,
  SUBSCRIPTION_MEMBER_PLAN,
} from './types';
import { transitions } from '../transactions/transactionProcessPurchase';

export const freePlanDetails = [
  'Basic account features',
  ' Basic rewards',
  ' Payout 5 working days after delivery',
  ' 10% selling fees',
  'Individual',
];

export const additionalPlanDetails = [
  'Stoado verification service',
  'Sell up to £500 per month',
  'Sell up to 50 items per month',
];

export const memberPlanDetails = [
  'Enhanced account features',
  'Up to 10x better rewards',
  'Instant payouts',
  ' 8% selling fees',
  'Priority customer support',
  'Access to Cryptocurrency',
  '30 days free trial after sign up',
  'Individual or business',
];

export const memberPerks = [
  '1 free weekly spin',
  'Stoado verification service',
  'Chargeback Protection',
  ' Return Protection',
  'Sell up to £25,000 per month',
  'Sell up to 1000 items per month',
];

export const businessPlanDetails = [
  'Business account features',
  'Enhanced Rewards',
  'Instant payouts',
  '5% selling fees',
  'Cryptocurrency',
  'VIP customer support',
  '30 days free trial after sign up',
  'business only',
];

export const businessPerks = [
  'Enhanced Chargeback Protection',
  'Enhanced Return Protection',
  'No Selling Limits',
];

export function getFileExtension(filePath) {
  const extIndex = filePath.lastIndexOf('.');
  return extIndex > 0 ? filePath.substring(extIndex + 1) : '';
}

export const getUserDetails = user => {
  const fullName = user?.attributes?.profile?.publicData?.fullName;
  let profileImage = null;
  if (!!user?.id && user?.profileImage?.attributes?.variants) {
    if (user?.profileImage?.attributes?.variants?.default) {
      profileImage = user?.profileImage?.attributes?.variants?.default?.url;
    } else {
      profileImage = user?.profileImage?.attributes?.variants['square-small2x']?.url;
    }
  } else {
    profileImage = user?.attributes?.profile?.publicData?.picture;
  }
  const email =
    !!user?.id && user?.attributes?.email
      ? user?.attributes?.email
      : user?.attributes?.profile?.publicData?.email;
  const id = user?.id && user?.id?.uuid;
  const firstName =
    user?.attributes?.profile?.displayName && user?.attributes?.profile?.displayName.split(' ')[0];
  return {
    fullName,
    email,
    id,
    firstName,
  };
};

export const getLabel = (category, key) => {
  const label = category.find(c => c.option === key);
  return label ? label.label : key;
};

export const popularCategories = [
  {
    label: 'Phones & Accessories',
    icon: phonesIcon,
    search: '?refinementList=phones-accessories',
  },
  {
    label: 'Computers & Laptops',
    icon: computerIcon,
    search: '?refinementList=computers-laptops',
  },
  { label: 'Clothing', icon: clothingIcon, search: '?refinementList=clothing' },
  { label: 'TV & Video', icon: tvIcon, search: '?refinementList=tv-video' },
  { label: 'Watches', icon: watchesIcon, search: '?refinementList=watches' },
  {
    label: 'Headphones & MP3 Players',
    icon: headPhonesIcon,
    search: '?refinementList=headphones-mP3-players',
  },
];

export const popularSubCategories = [
  {
    label: 'Phones & Accessories',
    key: 'phones-accessories',
    search: '?pub_subCategoryChild=phones-accessories',
  },
  {
    label: 'Computers & Laptops',
    key: 'computers-laptops',
    search: '?pub_subCategoryChild=computers-laptops',
  },
  {
    label: 'Men’s Clothing',
    key: 'mens-clothing',
    search: '?pub_subCategory=mens-clothing',
  },
  {
    label: ' Women’s Clothing',
    key: 'womens-clothing',
    search: '?pub_subCategory=womens-clothing',
  },
  { label: 'TV & Video', key: 'tv-video', search: '?pub_subCategory=tv-video' },
  { label: 'Watches', key: 'watches', search: '?pub_subCategory=watches' },
  {
    label: 'Headphones & MP3 Players',
    key: 'headphones-mP3-players',
    search: '?pub_subCategory=headphones-mP3-players',
  },
];

export const extractSoldStats = response => {
  const includedData = response.data.included;
  const listingsSoldCount =
    includedData[0]?.attributes?.profile?.publicData?.listingsSoldCount || 0;
  const listingsSoldPrice =
    includedData[0]?.attributes?.profile?.publicData?.listingsSoldPrice || 0;
  return { listingsSoldCount, listingsSoldPrice };
};

export const getTotalCount = (listingsSoldCount, newListingCount) => {
  return newListingCount ? listingsSoldCount + newListingCount : listingsSoldCount + 1 || 0;
};

export const getTotalPrice = (listingsSoldPrice, newPrice) => {
  return listingsSoldPrice + newPrice;
};

export const checkPriceLimit = (totalPrice, freePlanData, currentPlanData) => {
  const isExceedPriceLimit =
    (totalPrice >= FREE_PLAN_PRICE_LIMIT && freePlanData?.isFreePlanActive) ||
    (totalPrice >= MEMBER_PLAN_PRICE_LIMIT &&
      currentPlanData?.planName === SUBSCRIPTION_MEMBER_PLAN);
  return isExceedPriceLimit;
};

export const checkCountLimit = (totalCount, freePlanData, currentPlanData) => {
  const isExceedCountLimit =
    (totalCount === FREE_PLAN_COUNT_LIMIT && freePlanData?.isFreePlanActive) ||
    (totalCount === MEMBER_PLAN_COUNT_LIMIT && currentPlanData?.planName === SUBSCRIPTION_MEMBER_PLAN);
  return isExceedCountLimit;
};

export const filterCartItems = (cartItems, listingId) => {
  return cartItems && cartItems.filter(item => !listingId.includes(item.listingId));
};

const downloadFile = (fileUrl, fileName) => {
  const link = document.createElement('a');
  link.href = fileUrl;
  link.download = fileName;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadFiles = (url, name) => {
  const pdfFileUrl = url;
  const pdfFileName = name;
  return downloadFile(pdfFileUrl, pdfFileName);
};


export const orderSaleTransitions = [ 
  transitions.REQUEST_PAYMENT,
  transitions.CONFIRM_PAYMENT,
  transitions.EXPIRE_PAYMENT,
  transitions.AUTO_COMPLETE,
  transitions.MARK_DELIVERED,
  transitions.OFFER_ACCEPT_BY_PROVIDER,
  transitions.CANCEL,
  transitions.EXPIRE_REVIEW_PERIOD,
  transitions.REVIEW_2_BY_CUSTOMER,
  transitions.EXPIRE_CUSTOMER_REVIEW_PERIOD,
  transitions.REVIEW_1_BY_CUSTOMER,
  transitions.REVIEW_2_BY_PROVIDER,
  transitions.REVIEW_1_BY_PROVIDER,
  transitions.TRANSITION_PRINT_SHIPPING_LABEL,
  transitions.OPERATOR_MARK_DELIVERED_AFTER_VERIFIED,
  transitions.ADMIN_VERIFICATION_DONE,
  transitions.ADMIN_VERIFICATION_CANCEL,
  transitions.OPERATOR_MARK_DELIVERED_AFTER_VERIFIED,
  transitions.DISPUTE,
  transitions.DISPUTE_VERIFICATION_DONE,
  transitions.DISPUTE_VERIFICATION_FAILED,
  transitions.RETURN_SHIPPING_LABEL_BY_CUSTOMER,
  transitions.INITIATE_REFUND,
  transitions.AUTO_COMPLETE_AFTER_DISPUTE,
];