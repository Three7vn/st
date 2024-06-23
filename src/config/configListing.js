/////////////////////////////////////////////////////////
// Configurations related to listing.                  //
// Main configuration here is the extended data config //
/////////////////////////////////////////////////////////

// Note: The listingFields come from listingFields asset nowadays by default.
//       To use this built-in configuration, you need to change the overwrite from configHelper.js
//       (E.g. use mergeDefaultTypesAndFieldsForDebugging func)

/**
 * Configuration options for listing fields (custom extended data fields):
 * - key:                           Unique key for the extended data field.
 * - scope (optional):              Scope of the extended data can be either 'public' or 'private'.
 *                                  Default value: 'public'.
 *                                  Note: listing doesn't support 'protected' scope atm.
 * - includeForListingTypes:        An array of listing types, for which the extended
 *   (optional)                     data is relevant and should be added.
 * - schemaType (optional):         Schema for this extended data field.
 *                                  This is relevant when rendering components and querying listings.
 *                                  Possible values: 'enum', 'multi-enum', 'text', 'long', 'boolean'.
 * - enumOptions (optional):        Options shown for 'enum' and 'multi-enum' extended data.
 *                                  These are used to render options for inputs and filters on
 *                                  EditListingPage, ListingPage, and SearchPage.
 * - filterConfig:                  Filter configuration for listings query.
 *    - indexForSearch (optional):    If set as true, it is assumed that the extended data key has
 *                                    search index in place. I.e. the key can be used to filter
 *                                    listing queries (then scope needs to be 'public').
 *                                    Note: Flex CLI can be used to set search index for the key:
 *                                    https://www.sharetribe.com/docs/references/extended-data/#search-schema
 *                                    Read more about filtering listings with public data keys from API Reference:
 *                                    https://www.sharetribe.com/api-reference/marketplace.html#extended-data-filtering
 *                                    Default value: false,
 *   - filterType:                    Sometimes a single schemaType can be rendered with different filter components.
 *                                    For 'enum' schema, filterType can be 'SelectSingleFilter' or 'SelectMultipleFilter'
 *   - label:                         Label for the filter, if the field can be used as query filter
 *   - searchMode (optional):         Search mode for indexed data with multi-enum schema.
 *                                    Possible values: 'has_all' or 'has_any'.
 *   - group:                         SearchPageWithMap has grouped filters. Possible values: 'primary' or 'secondary'.
 * - showConfig:                    Configuration for rendering listing. (How the field should be shown.)
 *   - label:                         Label for the saved data.
 *   - isDetail                       Can be used to hide detail row (of type enum, boolean, or long) from listing page.
 *                                    Default value: true,
 * - saveConfig:                    Configuration for adding and modifying extended data fields.
 *   - label:                         Label for the input field.
 *   - placeholderMessage (optional): Default message for user input.
 *   - isRequired (optional):         Is the field required for providers to fill
 *   - requiredMessage (optional):    Message for those fields, which are mandatory.
 */

export const receiveOffers = [
  { option: '', label: 'Select one...' },
  { option: 'no', label: 'No, I don’t want to receive offers' },
  { option: 'yes', label: 'Yes,I would like to receive offers' },
];
export const dispatchTimes = [
  { option: 1, label: '1 Day' },
  { option: 2, label: '2 Days' },
  { option: 3, label: '3 Days' },
  { option: 4, label: '4 Days' },
  { option: 1, label: '1 week' },
];
export const userTypes = [
  { option: 'individual-user', label: 'I am an individual' },
  { option: 'business-user', label: 'I am a business' },
];
export const listingCategories = [
  { option: 'electronics', label: 'Electronics' },
  { option: 'home', label: 'Home' },
  { option: 'watches', label: 'Watches' },
  { option: 'clothing', label: 'Clothing' },
  { option: 'art-antiques', label: 'Art & Antiques' },
  { option: 'sporting-goods', label: 'Sporting Goods' },
  { option: 'games-hobbies', label: 'Games & Hobbies' },
  { option: 'health-beauty', label: 'Health & Beauty' },
  { option: 'pets', label: 'Pets' },
  { option: 'baby-children', label: 'Baby & Children' },
];
export const listingSubCategories = [
  //electronics
  { parentCollection: 'electronics', label: 'Phones & Accessories', option: 'phones-accessories' },
  { parentCollection: 'electronics', label: 'Computers & Laptops', option: 'computers-laptops' },
  { parentCollection: 'electronics', label: 'Tablets & E-Readers', option: 'tablets-E-Readers' },
  {
    parentCollection: 'electronics',
    label: 'Video Games & Consoles',
    option: 'video-games-consoles',
  },
  { parentCollection: 'electronics', label: 'Wearables', option: 'wearables' },
  {
    parentCollection: 'electronics',
    label: 'Headphones & MP3 Players',
    option: 'headphones-mP3-players',
  },
  {
    parentCollection: 'electronics',
    label: 'Cameras & Photography',
    option: 'cameras-photography',
  },
  { parentCollection: 'electronics', label: 'Media', option: 'media' },
  { parentCollection: 'electronics', label: 'Home Audio', option: 'home-audio' },
  { parentCollection: 'electronics', label: 'TV & Video', option: 'tv-video' },

  //home
  { parentCollection: 'home', label: 'Kitchen & Dining', option: 'kitchen-dining' },
  { parentCollection: 'home', label: 'Smart Home', option: 'smart-home' },
  { parentCollection: 'home', label: 'Home Decor', option: 'home-decor' },
  { parentCollection: 'home', label: 'Home Appliances', option: 'home-appliances' },
  { parentCollection: 'home', label: 'Bedding', option: 'bedding' },
  { parentCollection: 'home', label: 'Storage & Organisation', option: 'storage-organisation' },
  {
    parentCollection: 'home',
    label: 'Cleaning Tools & Supplies',
    option: 'cleaning-tools-supplies',
  },
  { parentCollection: 'home', label: 'Furniture', option: 'furniture' },
  { parentCollection: 'home', label: 'Bath', option: 'bath' },
  { parentCollection: 'home', label: 'Other', option: 'other' },

  //watches
  { parentCollection: 'watches', label: 'Watches', option: 'watches' },
  { parentCollection: 'watches', label: 'Watch Accessories', option: 'watch-accessories' },
  { parentCollection: 'watches', label: 'Watch Parts & Tools', option: 'watch-parts-tools' },
  { parentCollection: 'watches', label: 'Other', option: 'other' },

  //clothing
  { parentCollection: 'clothing', label: 'Womens Clothing', option: 'womens-clothing' },
  { parentCollection: 'clothing', label: 'Mens Clothing', option: 'mens-clothing' },
  { parentCollection: 'clothing', label: 'Shoes', option: 'shoes' },
  { parentCollection: 'clothing', label: 'Accessories', option: 'accessories' },
  { parentCollection: 'clothing', label: 'Jewelry', option: 'jewelry' },
  { parentCollection: 'clothing', label: 'Handbags & Bags', option: 'handbags-bags' },
  { parentCollection: 'clothing', label: 'Other', option: 'other' },

  //art-antiques
  { parentCollection: 'art-antiques', label: 'Art', option: 'art' },
  { parentCollection: 'art-antiques', label: 'Collectibles', option: 'collectibles' },
  { parentCollection: 'art-antiques', label: 'Antiques', option: 'antiques' },
  { parentCollection: 'art-antiques', label: 'Memorabilia', option: 'memorabilia' },

  //sporting-goods
  { parentCollection: 'sporting-goods', label: 'Outdoor Sports', option: 'outdoor-sports' },
  { parentCollection: 'sporting-goods', label: 'Team Sports', option: 'team-sports' },
  { parentCollection: 'sporting-goods', label: 'Fitness', option: 'fitness' },
  { parentCollection: 'sporting-goods', label: 'Other', option: 'other' },

  //games-hobbies
  { parentCollection: 'games-hobbies', label: 'Games', option: 'games' },
  { parentCollection: 'games-hobbies', label: 'Crafting', option: 'crafting' },
  { parentCollection: 'games-hobbies', label: 'Other', option: 'other' },

  //health-beauty
  { parentCollection: 'health-beauty', label: 'Health Care', option: 'health-care' },
  { parentCollection: 'health-beauty', label: 'Beauty', option: 'beauty' },
  { parentCollection: 'health-beauty', label: 'Other', option: 'other' },

  //pets
  { parentCollection: 'pets', label: 'Dog Supplies', option: 'dog-supplies' },
  { parentCollection: 'pets', label: 'Cat Supplies', option: 'cat-supplies' },
  { parentCollection: 'pets', label: 'Fish & Aquariums', option: 'fish-aquariums' },
  { parentCollection: 'pets', label: 'Bird Supplies', option: 'bird-supplies' },
  { parentCollection: 'pets', label: 'Small Animal Supplies', option: 'small-animal-supplies' },
  { parentCollection: 'pets', label: 'Other', option: 'other' },

  //baby-children
  { parentCollection: 'baby-children', label: 'Baby Clothing', option: 'baby-clothing' },
  { parentCollection: 'baby-children', label: 'Baby Gear', option: 'baby-gear' },
  { parentCollection: 'baby-children', label: 'Toys', option: 'toys' },
  { parentCollection: 'baby-children', label: 'Maternity Clothing', option: 'maternity-clothing' },
  { parentCollection: 'baby-children', label: 'Other', option: 'other' },
];
export const listingSubCategoriesChild = [
  //phones-accessories
  { parentCategory: 'phones-accessories', label: 'Batteries', option: 'batteries' },
  { parentCategory: 'phones-accessories', label: 'Phone Accessories', option: 'phone-accessories' },
  { parentCategory: 'phones-accessories', label: 'Smartphones', option: 'smartphones' },
  // { parentCategory: 'phones-accessories', label: 'Video Games & Consoles' ,option:"video-games-consoles"},
  { parentCategory: 'phones-accessories', label: 'Screen Protectors', option: 'screen-protectors' },
  { parentCategory: 'phones-accessories', label: 'Other', option: 'other' },

  //computers-laptops
  {
    parentCategory: 'computers-laptops',
    label: 'Computer Accessories',
    option: 'computer-accessories',
  },
  {
    parentCategory: 'computers-laptops',
    label: 'Computers & Laptops',
    option: 'computers-laptops',
  },
  { parentCategory: 'computers-laptops', label: 'Gaming PCs', option: 'gaming-pCs' },
  { parentCategory: 'computers-laptops', label: 'Monitors & Screens', option: 'monitors-screens' },
  {
    parentCategory: 'computers-laptops',
    label: 'Networking & Connectivity',
    option: 'networking-connectivity',
  },
  { parentCategory: 'computers-laptops', label: 'Other', option: 'other' },

  //tablets-E-Readers
  {
    parentCategory: 'tablets-E-Readers',
    label: 'Tablets & E-Readers',
    option: 'tablets-E-Readers',
  },
  { parentCategory: 'tablets-E-Readers', label: 'Accessories', option: 'accessories' },

  //video-games-consoles
  { parentCategory: 'video-games-consoles', label: 'Accessories', option: 'accessories' },
  { parentCategory: 'video-games-consoles', label: 'Consoles', option: 'consoles' },
  { parentCategory: 'video-games-consoles', label: 'Games', option: 'games' },
  { parentCategory: 'video-games-consoles', label: 'PC Gaming', option: 'pC-gaming' },
  {
    parentCategory: 'video-games-consoles',
    label: 'Replacement Parts & Tools',
    option: 'replacement-parts-tools',
  },
  { parentCategory: 'video-games-consoles', label: 'Other', option: 'other' },

  //wearables
  { parentCategory: 'wearables', label: 'Fitness Trackers', option: 'fitness-trackers' },
  { parentCategory: 'wearables', label: 'Smart Watches', option: 'smart-watches' },
  {
    parentCategory: 'wearables',
    label: 'Smart Watch Accessories',
    option: 'smart-watch-accessories',
  },
  { parentCategory: 'wearables', label: 'Other', option: 'other' },

  //headphones-mP3-players
  { parentCategory: 'headphones-mP3-players', label: 'Headphones', option: 'headphones' },
  { parentCategory: 'headphones-mP3-players', label: 'MP3 Players', option: 'mP3-players' },
  { parentCategory: 'headphones-mP3-players', label: 'Other', option: 'other' },

  //cameras-photography
  { parentCategory: 'cameras-photography', label: 'Camcorders', option: 'camcorders' },
  {
    parentCategory: 'cameras-photography',
    label: 'Camera & Photo Accessories',
    option: 'camera-photo-accessories',
  },
  { parentCategory: 'cameras-photography', label: 'Digital Cameras', option: 'digital-cameras' },
  {
    parentCategory: 'cameras-photography',
    label: 'Film & Polaroid Cameras',
    option: 'film-polaroid-cameras',
  },
  { parentCategory: 'cameras-photography', label: 'Other', option: 'other' },

  //media
  { parentCategory: 'media', label: 'Blu-ray', option: 'blu-ray' },
  { parentCategory: 'media', label: 'CD', option: 'cd' },
  { parentCategory: 'media', label: 'DVD', option: 'dvd' },
  { parentCategory: 'media', label: 'Other', option: 'other' },

  //home-audio
  { parentCategory: 'home-audio', label: 'Audio Accessories', option: 'audio-accessories' },
  { parentCategory: 'home-audio', label: 'Bluetooth Speakers', option: 'bluetooth-speakers' },
  { parentCategory: 'home-audio', label: 'Docking Stations', option: 'docking-stations' },
  {
    parentCategory: 'home-audio',
    label: 'Portable Stereos & Boomboxes',
    option: 'portable-stereos-boomboxes',
  },
  { parentCategory: 'home-audio', label: 'Radios', option: 'radios' },
  {
    parentCategory: 'home-audio',
    label: 'Studio Recording Equipment',
    option: 'studio-recording-equipment',
  },
  { parentCategory: 'home-audio', label: 'Other', option: 'other' },

  //tv-video
  { parentCategory: 'tv-video', label: 'Televisions', option: 'televisions' },
  { parentCategory: 'tv-video', label: 'DVRs', option: 'dvrs' },
  { parentCategory: 'tv-video', label: 'Gadgets', option: 'gadgets' },
  { parentCategory: 'tv-video', label: 'Streaming Devices', option: 'streaming-devices' },
  { parentCategory: 'tv-video', label: 'Other', option: 'other' },
];
export const listingConditions = [
  {
    option: 'new',
    label: 'New',
    parentCollection: [
      'baby-children',
      'health-beauty',
      'pets',
      'electronics',
      'home',
      'watches',
      'clothing',
      'art-antiques',
      'sporting-goods',
      'games-hobbies',
    ],
  },
  {
    option: 'new-opened',
    label: 'New - Opened',
    parentCollection: [
      'baby-children',
      'health-beauty',
      'pets',
      'electronics',
      'home',
      'watches',
      'clothing',
      'art-antiques',
      'sporting-goods',
      'games-hobbies',
    ],
  },
  {
    option: 'used',
    label: 'Used',
    parentCollection: [
      'baby-children',
      'health-beauty',
      'pets',
      'electronics',
      'home',
      'watches',
      'clothing',
      'art-antiques',
      'sporting-goods',
      'games-hobbies',
    ],
  },
  {
    option: 'used-like-new',
    label: 'Used - Like New',
    parentCollection: [
      'baby-children',
      'health-beauty',
      'pets',
      'electronics',
      'home',
      'watches',
      'clothing',
      'art-antiques',
      'sporting-goods',
      'games-hobbies',
    ],
  },
  {
    option: 'parts-Not-functioning',
    label: 'Parts/Not Functioning',
    parentCollection: ['electronics', 'home', 'watches'],
  },
];
export const listingColors = [
  {
    option: 'not-specified',
    label: 'Not Specified',
    // parentSubCategory: ['smart-watch-accessories'],
  },
  { option: 'black', label: 'Black', parentSubCategory: [] },
  { option: 'white', label: 'White', parentSubCategory: [] },
  { option: 'grey', label: 'Grey', parentSubCategory: [] },
  { option: 'brown', label: 'Brown', parentSubCategory: [] },

  { option: 'beige', label: 'Beige', parentSubCategory: [] },
  { option: 'red', label: 'Red', parentSubCategory: [] },
  { option: 'orange', label: 'Orange', parentSubCategory: [] },
  { option: 'yellow', label: 'Yellow', parentSubCategory: [] },
  { option: 'green', label: 'Green', parentSubCategory: [] },

  { option: 'blue', label: 'Blue', parentSubCategory: [] },
  { option: 'purple', label: 'Purple', parentSubCategory: [] },
  { option: 'pink', label: 'Pink', parentSubCategory: [] },
  { option: 'multicolor', label: 'Multicolor', parentSubCategory: [] },
  { option: 'silver', label: 'Silver', parentSubCategory: [] },

  { option: 'gold', label: 'Gold', parentSubCategory: [] },
  { option: 'assorted', label: 'Assorted', parentSubCategory: [] },
  { option: 'pattern', label: 'Pattern', parentSubCategory: [] },
  { option: 'multicolor', label: 'Multicolor', parentSubCategory: [] },
  { option: 'silver', label: 'Silver', parentSubCategory: [] },
];
export const listingRAMS = [
  {
    option: 'not-specified',
    label: 'Not Specified',
    parentSubCategory: ['computers-laptops', 'gaming-pCs'],
  },
  { option: '1-gb', label: '1 GB', parentSubCategory: ['computers-laptops', 'gaming-pCs'] },
  { option: '2-gb', label: '2 GB', parentSubCategory: ['computers-laptops', 'gaming-pCs'] },
  { option: '3-gb', label: '3 GB', parentSubCategory: ['computers-laptops', 'gaming-pCs'] },
  { option: '4-gb', label: '4 GB', parentSubCategory: ['computers-laptops', 'gaming-pCs'] },
  { option: '5-gb', label: '5 GB', parentSubCategory: ['computers-laptops', 'gaming-pCs'] },
  { option: '6-gb', label: '6 GB', parentSubCategory: ['computers-laptops', 'gaming-pCs'] },
  { option: '7-gb', label: '7 GB', parentSubCategory: ['computers-laptops', 'gaming-pCs'] },
  { option: '8-gb', label: '8 GB', parentSubCategory: ['computers-laptops', 'gaming-pCs'] },
  { option: '9-gb', label: '9 GB', parentSubCategory: ['computers-laptops', 'gaming-pCs'] },
  { option: '10-gb', label: '10 GB', parentSubCategory: ['computers-laptops', 'gaming-pCs'] },
  { option: '12-gb', label: '12 GB', parentSubCategory: ['computers-laptops', 'gaming-pCs'] },
  { option: '24-gb', label: '24 GB', parentSubCategory: ['computers-laptops', 'gaming-pCs'] },
  { option: '32-gb', label: '32 GB', parentSubCategory: ['computers-laptops', 'gaming-pCs'] },
  { option: '64-gb', label: '64 GB', parentSubCategory: ['computers-laptops', 'gaming-pCs'] },
  { option: '128-gb', label: '128 GB', parentSubCategory: ['computers-laptops', 'gaming-pCs'] },
  { option: '256-gb', label: '256 GB', parentSubCategory: ['computers-laptops', 'gaming-pCs'] },
  { option: '512-gb', label: '512 GB', parentSubCategory: ['computers-laptops', 'gaming-pCs'] },
];
export const listingOperatingSystem = [
  { option: 'not-specified', label: 'Not Specified', parentSubCategory: ['computers-laptops','gaming-pCs']},
  {"option": "chrome-os", "label": "Chrome OS",parentSubCategory: ['computers-laptops','gaming-pCs']},
  {"option": "dos", "label": "DOS",parentSubCategory: ['computers-laptops','gaming-pCs']},
  {"option": "freedos", "label": "FreeDOS",parentSubCategory: ['computers-laptops','gaming-pCs']},
  {"option": "linux", "label": "Linux",parentSubCategory: ['computers-laptops','gaming-pCs']},
  {"option": "not-included", "label": "Not Included",parentSubCategory: ['computers-laptops','gaming-pCs']},
  {"option": "macOS", "label": "MacOS",parentSubCategory: ['computers-laptops','gaming-pCs']},
  {"option": "ubuntu", "label": "Ubuntu",parentSubCategory: ['computers-laptops','gaming-pCs']},
  {"option": "windows-10", "label": "Windows 10",parentSubCategory: ['computers-laptops','gaming-pCs']},
  {"option": "windows-10-education", "label": "Windows 10 Education",parentSubCategory: ['computers-laptops','gaming-pCs']},
  {"option": "windows-10-home", "label": "Windows 10 Home",parentSubCategory: ['computers-laptops','gaming-pCs']},
  {"option": "windows-10-pro", "label": "Windows 10 Pro",parentSubCategory: ['computers-laptops','gaming-pCs']},
  {"option": "windows-10-s", "label": "Windows 10 S",parentSubCategory: ['computers-laptops','gaming-pCs']},
  {"option": "windows-11-home", "label": "Windows 11 Home",parentSubCategory: ['computers-laptops','gaming-pCs']},
  {"option": "windows-11-pro", "label": "Windows 11 Pro",parentSubCategory: ['computers-laptops','gaming-pCs']},
  {"option": "windows-2000", "label": "Windows 2000",parentSubCategory: ['computers-laptops','gaming-pCs']},
  {"option": "windows-2003", "label": "Windows 2003",parentSubCategory: ['computers-laptops','gaming-pCs']},
  {"option": "windows-7", "label": "Windows 7",parentSubCategory: ['computers-laptops','gaming-pCs']},
  {"option": "windows-7-professional", "label": "Windows 7 Professional",parentSubCategory: ['computers-laptops','gaming-pCs']},
  {"option": "windows-8", "label": "Windows 8",parentSubCategory: ['computers-laptops','gaming-pCs']},
  {"option": "windows-8.1", "label": "Windows 8.1",parentSubCategory: ['computers-laptops','gaming-pCs']},
  {"option": "windows-8.1-professional", "label": "Windows 8.1 Professional",parentSubCategory: ['computers-laptops','gaming-pCs']},
  {"option": "windows-95", "label": "Windows 95",parentSubCategory: ['computers-laptops','gaming-pCs']},
  {"option": "windows-98", "label": "Windows 98",parentSubCategory: ['computers-laptops','gaming-pCs']},
  {"option": "windows-me", "label": "Windows ME",parentSubCategory: ['computers-laptops','gaming-pCs']},
  {"option": "windows-nt", "label": "Windows NT",parentSubCategory: ['computers-laptops','gaming-pCs']},
  {"option": "windows-rt", "label": "Windows RT",parentSubCategory: ['computers-laptops','gaming-pCs']},
  {"option": "windows-vista", "label": "Windows Vista",parentSubCategory: ['computers-laptops','gaming-pCs']},
  {"option": "windows-xp", "label": "Windows XP",parentSubCategory: ['computers-laptops','gaming-pCs']}
];
export const listingStorageType = [
  { option: 'not-specified', label: 'Not Specified', parentSubCategory: ['computers-laptops','gaming-pCs']},
  {"option": "emcp", "label": "eMCP", parentSubCategory: ['computers-laptops','gaming-pCs']},
  {"option": "emmc", "label": "eMMC", parentSubCategory: ['computers-laptops','gaming-pCs']},
  {"option": "eufs", "label": "eUFS (Embedded Universal Flash Storage)", parentSubCategory: ['computers-laptops','gaming-pCs']},
  {"option": "hdd", "label": "HDD (Hard Disk Drive)", parentSubCategory: ['computers-laptops','gaming-pCs']},
  {"option": "hdd-+-ssd", "label": "HDD + SSD", parentSubCategory: ['computers-laptops','gaming-pCs']},
  {"option": "nvme", "label": "NVMe (Non-Volatile Memory Express)", parentSubCategory: ['computers-laptops','gaming-pCs']},
  {"option": "ssd", "label": "SSD (Solid State Drive)", parentSubCategory: ['computers-laptops','gaming-pCs']},
  {"option": "sshd", "label": "SSHD (Solid State Hybrid Drive)", parentSubCategory: ['computers-laptops','gaming-pCs']},
  {"option": "ufs", "label": "UFS (Universal Flash Storage)", parentSubCategory: ['computers-laptops','gaming-pCs']},
];
export const listingRefreshRate = [
  { option: 'not-specified', label: 'Not Specified', parentSubCategory: ['monitors-screens'] },
  { option: '360-hz', label: '360 Hz', parentSubCategory: ['monitors-screens'] },
  { option: '60-hz', label: '60 Hz', parentSubCategory: ['monitors-screens'] },
  { option: '75-hz', label: '75 Hz', parentSubCategory: ['monitors-screens'] },
  { option: '76-hz', label: '76 Hz', parentSubCategory: ['monitors-screens'] },
  { option: '85-hz', label: '85 Hz', parentSubCategory: ['monitors-screens'] },
  { option: '86-hz', label: '86 Hz', parentSubCategory: ['monitors-screens'] },
  { option: '100-hz', label: '100 Hz', parentSubCategory: ['monitors-screens'] },
  { option: '120-hz', label: '120 Hz', parentSubCategory: ['monitors-screens'] },
  { option: '144-hz', label: '144 Hz', parentSubCategory: ['monitors-screens'] },
  { option: '165-hz', label: '165 Hz', parentSubCategory: ['monitors-screens'] },
  { option: '240-hz', label: '240 Hz', parentSubCategory: ['monitors-screens'] },
];
export const listingVideoInputs = [
  { option: 'not-specified', label: 'Not Specified', parentSubCategory: ['monitors-screens'] },
  {
    option: 'coaxial-belling-lee',
    label: 'Coaxial Belling-Lee',
    parentSubCategory: ['monitors-screens'],
  },
  { option: 'coaxial-bnc', label: 'Coaxial BNC', parentSubCategory: ['monitors-screens'] },
  { option: 'coaxial-f', label: 'Coaxial F', parentSubCategory: ['monitors-screens'] },
  { option: 'component-bnc', label: 'Component BNC', parentSubCategory: ['monitors-screens'] },
  { option: 'composite-rca', label: 'Composite RCA', parentSubCategory: ['monitors-screens'] },
  { option: 'displayport', label: 'DisplayPort', parentSubCategory: ['monitors-screens'] },
  { option: 'dms-59', label: 'DMS-59', parentSubCategory: ['monitors-screens'] },
  { option: 'dvi-d', label: 'DVI-D', parentSubCategory: ['monitors-screens'] },
  { option: 'dvi-i', label: 'DVI-I', parentSubCategory: ['monitors-screens'] },
  { option: 'firewire', label: 'FireWire', parentSubCategory: ['monitors-screens'] },
  { option: 'hdmi-1.4', label: 'HDMI 1.4', parentSubCategory: ['monitors-screens'] },
  { option: 'hdmi-1.4a', label: 'HDMI 1.4a', parentSubCategory: ['monitors-screens'] },
  { option: 'hdmi-2.0', label: 'HDMI 2.0', parentSubCategory: ['monitors-screens'] },
  { option: 'hdmi-2.1', label: 'HDMI 2.1', parentSubCategory: ['monitors-screens'] },
  { option: 'hdmi-micro', label: 'HDMI Micro', parentSubCategory: ['monitors-screens'] },
  { option: 'hdmi-mini', label: 'HDMI Mini', parentSubCategory: ['monitors-screens'] },
  { option: 'hdmi-standard', label: 'HDMI Standard', parentSubCategory: ['monitors-screens'] },
  {
    option: 'mini-displayport',
    label: 'Mini DisplayPort',
    parentSubCategory: ['monitors-screens'],
  },
  { option: 'mini-dvi', label: 'Mini-DVI', parentSubCategory: ['monitors-screens'] },
  { option: 'stereo-3d', label: 'Stereo 3D', parentSubCategory: ['monitors-screens'] },
  { option: 's-video', label: 'S-Video', parentSubCategory: ['monitors-screens'] },
  { option: 'usb-2.0', label: 'USB 2.0', parentSubCategory: ['monitors-screens'] },
  { option: 'usb-3.0', label: 'USB 3.0', parentSubCategory: ['monitors-screens'] },
  { option: 'usb-3.1', label: 'USB 3.1', parentSubCategory: ['monitors-screens'] },
  { option: 'usb-c', label: 'USB-C', parentSubCategory: ['monitors-screens'] },
  { option: 'vga-d-sub', label: 'VGA D-Sub', parentSubCategory: ['monitors-screens'] },
];
export const listingDisplayType = [
  { option: 'not-specified', label: 'Not Specified', parentSubCategory: ['monitors-screens'] },
  { option: 'ads', label: 'ADS', parentSubCategory: ['monitors-screens'] },
  { option: 'crt', label: 'CRT', parentSubCategory: ['monitors-screens'] },
  { option: 'ips-lcd', label: 'IPS LCD', parentSubCategory: ['monitors-screens'] },
  { option: 'ips-led', label: 'IPS LED', parentSubCategory: ['monitors-screens'] },
  { option: 'lcd', label: 'LCD', parentSubCategory: ['monitors-screens'] },
  { option: 'led-backlight', label: 'LED Backlight', parentSubCategory: ['monitors-screens'] },
  { option: 'oled', label: 'OLED', parentSubCategory: ['monitors-screens'] },
  { option: 'plasma', label: 'Plasma', parentSubCategory: ['monitors-screens'] },
  { option: 'pls', label: 'PLS', parentSubCategory: ['monitors-screens'] },
  { option: 'qled', label: 'QLED', parentSubCategory: ['monitors-screens'] },
  { option: 'tft', label: 'TFT', parentSubCategory: ['monitors-screens'] },
  { option: 'tn-lcd', label: 'TN LCD', parentSubCategory: ['monitors-screens'] },
  { option: 'tn-led', label: 'TN LED', parentSubCategory: ['monitors-screens'] },
  { option: 'va-lcd', label: 'VA LCD', parentSubCategory: ['monitors-screens'] },
  { option: 'va-led', label: 'VA LED', parentSubCategory: ['monitors-screens'] },
];
export const listingConnectivity = [
  { option: 'not-specified', label: 'Not Specified', parentSubCategory: ['consoles'] },
  { option: 'component-rca', label: 'Component RCA', parentSubCategory: ['consoles'] },
  { option: 'composite-rca', label: 'Composite RCA', parentSubCategory: ['consoles'] },
  { option: 'hdmi', label: 'HDMI', parentSubCategory: ['consoles'] },
  { option: 'headphone-jack', label: 'Headphone Jack', parentSubCategory: ['consoles'] },
  { option: 'rf', label: 'RF', parentSubCategory: ['consoles'] },
  { option: 'scart', label: 'SCART', parentSubCategory: ['consoles'] },
  { option: 's-video', label: 'S-Video', parentSubCategory: ['consoles'] },
  { option: 'usb-a', label: 'USB-A', parentSubCategory: ['consoles'] },
  { option: 'usb-c', label: 'USB-C', parentSubCategory: ['consoles'] },
  { option: 'vga', label: 'VGA', parentSubCategory: ['consoles'] },
];
export const listingOpticalZoom = [
  { option: 'not-specified', label: 'Not Specified', parentSubCategory: ['digital-cameras'] },
  { option: 'lessthan3x', label: 'Less than 3x', parentSubCategory: ['digital-cameras'] },
  { option: '3-9.9x', label: '3-9.9x', parentSubCategory: ['digital-cameras'] },
  { option: '10-19.9x', label: '10-19.9x', parentSubCategory: ['digital-cameras'] },
  { option: '20-29.9x', label: '20-29.9x', parentSubCategory: ['digital-cameras'] },
  { option: '30-40x', label: '30-40x', parentSubCategory: ['digital-cameras'] },
  { option: 'morethan40x', label: 'More than 40x', parentSubCategory: ['digital-cameras'] },
];
export const listingMaximumResolution = [
  {
    option: 'not-specified',
    label: 'Not Specified',
    parentSubCategory: ['digital-cameras', 'televisions'],
  },
  { option: '0.1-0.9-mp', label: '0.1-0.9 MP', parentSubCategory: ['digital-cameras'] },
  { option: '1-2.9-mp', label: '1-2.9 MP', parentSubCategory: ['digital-cameras'] },
  { option: '3-4.9-mp', label: '3-4.9 MP', parentSubCategory: ['digital-cameras'] },
  { option: '5-6.9-mp', label: '5-6.9 MP', parentSubCategory: ['digital-cameras'] },
  { option: '7-7.9-mp', label: '7-7.9 MP', parentSubCategory: ['digital-cameras'] },
  { option: '8-9.9-mp', label: '8-9.9 MP', parentSubCategory: ['digital-cameras'] },
  { option: '10-11.9-mp', label: '10-11.9 MP', parentSubCategory: ['digital-cameras'] },
  { option: '12-13.9-mp', label: '12-13.9 MP', parentSubCategory: ['digital-cameras'] },
  { option: '14-16.9-mp', label: '14-16.9 MP', parentSubCategory: ['digital-cameras'] },
  { option: '17-19.9-mp', label: '17-19.9 MP', parentSubCategory: ['digital-cameras'] },
  { option: '20-29.9-mp', label: '20-29.9 MP', parentSubCategory: ['digital-cameras'] },
  { option: '30-39.9-mp', label: '30-39.9 MP', parentSubCategory: ['digital-cameras'] },
  { option: '40-49.9-mp', label: '40-49.9 MP', parentSubCategory: ['digital-cameras'] },
  { option: '50-99.9-mp', label: '50-99.9 MP', parentSubCategory: ['digital-cameras'] },
  { option: '100-149.9-mp', label: '100-149.9 MP', parentSubCategory: ['digital-cameras'] },
  { option: '150-200-mp', label: '150-200 MP', parentSubCategory: ['digital-cameras'] },
  { option: 'more-than-200-mp', label: 'More than 200 MP', parentSubCategory: ['digital-cameras'] },
  { option: '1080i-fhd', label: '1080i (FHD)', parentSubCategory: ['televisions'] },
  { option: '1080p-fhd', label: '1080p (FHD)', parentSubCategory: ['televisions'] },
  { option: '1440p-2k', label: '1440p (2K)', parentSubCategory: ['televisions'] },
  { option: '2160p-4k', label: '2160p (4K)', parentSubCategory: ['televisions'] },
  { option: '240p', label: '240p', parentSubCategory: ['televisions'] },
  { option: '360p', label: '360p', parentSubCategory: ['televisions'] },
  { option: '4320p-8k', label: '4320p (8K)', parentSubCategory: ['televisions'] },
  { option: '480i', label: '480i', parentSubCategory: ['televisions'] },
  { option: '480p', label: '480p', parentSubCategory: ['televisions'] },
  { option: '576i', label: '576i', parentSubCategory: ['televisions'] },
  { option: '576p', label: '576p', parentSubCategory: ['televisions'] },
  { option: '720p-hd', label: '720p (HD)', parentSubCategory: ['televisions'] },
  { option: '768p', label: '768p', parentSubCategory: ['televisions'] },
];
export const listingBatteryTypes = [
  { option: 'not-specified', label: 'Not Specified', parentSubCategory: ['digital-cameras'] },
  { option: '2cr5', label: '2CR5', parentSubCategory: ['digital-cameras'] },
  { option: 'aa', label: 'AA', parentSubCategory: ['digital-cameras'] },
  { option: 'aaa', label: 'AAA', parentSubCategory: ['digital-cameras'] },
  { option: 'c', label: 'C', parentSubCategory: ['digital-cameras'] },
  { option: 'cr123', label: 'CR123', parentSubCategory: ['digital-cameras'] },
  { option: 'cr2', label: 'CR2', parentSubCategory: ['digital-cameras'] },
  { option: 'cr-v3', label: 'CR-V3', parentSubCategory: ['digital-cameras'] },
  { option: 'lithium', label: 'Lithium', parentSubCategory: ['digital-cameras'] },
  { option: 'lithium-ion', label: 'Lithium-Ion', parentSubCategory: ['digital-cameras'] },
  { option: 'lithium-polymer', label: 'Lithium Polymer', parentSubCategory: ['digital-cameras'] },
  { option: 'lp-e12', label: 'LP-E12', parentSubCategory: ['digital-cameras'] },
  { option: 'lp-e17', label: 'LP-E17', parentSubCategory: ['digital-cameras'] },
  { option: 'nb-13l', label: 'NB-13L', parentSubCategory: ['digital-cameras'] },
  { option: 'nimh', label: 'NiMH', parentSubCategory: ['digital-cameras'] },
];
export const listingDisplayTechnology = [
  { option: 'not-specified', label: 'Not Specified', parentSubCategory: ['televisions'] },
  { option: 'crt', label: 'CRT', parentSubCategory: ['televisions'] },
  { option: 'dlp', label: 'DLP', parentSubCategory: ['televisions'] },
  { option: 'lcd', label: 'LCD', parentSubCategory: ['televisions'] },
  { option: 'led', label: 'LED', parentSubCategory: ['televisions'] },
  { option: 'oled', label: 'OLED', parentSubCategory: ['televisions'] },
  { option: 'plasma', label: 'Plasma', parentSubCategory: ['televisions'] },
  { option: 'qled', label: 'QLED', parentSubCategory: ['televisions'] },
  { option: 'rear-projection', label: 'Rear-Projection', parentSubCategory: ['televisions'] },
];
export const listingDisplay = [
  { option: 'not-specified', label: 'Not Specified', parentSubCategory: ['watches'] },
  { option: 'analogue', label: 'Analogue', parentSubCategory: ['watches'] },
  { option: 'digital', label: 'Digital', parentSubCategory: ['watches'] },
  { option: 'analogue-digital', label: 'Analogue & Digital', parentSubCategory: ['watches'] },
];
export const listingSizes = [
  { option: 'not-specified', label: 'Not Specified', parentSubCategory: ['shoes'] },
  { option: '3', label: '3', parentSubCategory: ['shoes'] },
  { option: '3.5', label: '3.5', parentSubCategory: ['shoes'] },
  { option: '4', label: '4', parentSubCategory: ['shoes'] },
  { option: '4.5', label: '4.5', parentSubCategory: ['shoes'] },
  { option: '5', label: '5', parentSubCategory: ['shoes'] },
  { option: '5.5', label: '5.5', parentSubCategory: ['shoes'] },
  { option: '6', label: '6', parentSubCategory: ['shoes'] },
  { option: '6.5', label: '6.5', parentSubCategory: ['shoes'] },
  { option: '7', label: '7', parentSubCategory: ['shoes'] },
  { option: '7.5', label: '7.5', parentSubCategory: ['shoes'] },
  { option: '8', label: '8', parentSubCategory: ['shoes'] },
  { option: '8.5', label: '8.5', parentSubCategory: ['shoes'] },
  { option: '9', label: '9', parentSubCategory: ['shoes'] },
  { option: '9.5', label: '9.5', parentSubCategory: ['shoes'] },
  { option: '10', label: '10', parentSubCategory: ['shoes'] },
  { option: '10.5', label: '10.5', parentSubCategory: ['shoes'] },
  { option: '11', label: '11', parentSubCategory: ['shoes'] },
  { option: '11.5', label: '11.5', parentSubCategory: ['shoes'] },
  { option: '12', label: '12', parentSubCategory: ['shoes'] },
  { option: '12.5', label: '12.5', parentSubCategory: ['shoes'] },
  { option: '13', label: '13', parentSubCategory: ['shoes'] },
  { option: '13.5', label: '13.5', parentSubCategory: ['shoes'] },
  { option: '14', label: '14', parentSubCategory: ['shoes'] },
  { option: '14.5', label: '14.5', parentSubCategory: ['shoes'] },
  { option: '15', label: '15', parentSubCategory: ['shoes'] },
  { option: '15.5', label: '15.5', parentSubCategory: ['shoes'] },
  { option: '16', label: '16', parentSubCategory: ['shoes'] },
  { option: '16.5', label: '16.5', parentSubCategory: ['shoes'] },
  { option: '17', label: '17', parentSubCategory: ['shoes'] },
  { option: '17.5', label: '17.5', parentSubCategory: ['shoes'] },
  { option: '18.5', label: '18.5', parentSubCategory: ['shoes'] },
];

export const listingRefurbishes = [
  {
    option: 'not-specified',
    label: 'Not Specified',
    parentSubCategory: ['smartphones', 'other'],
    parentCategory: [],
  },
  {
    option: 'refurbushed-fair',
    label: 'Refurbushed - Fair',
    parentSubCategory: [
      'smartphones',
      'other',
      'computers-laptops',
      'gaming-pCs',
      'monitors-screens',
      'tablets-E-Readers',
      'consoles',
      'pC-gaming',
      'replacement-parts-tools',
      'fitness-trackers',
      'smart-watches',
      'headphones',
      'mP3-players',
      'camcorders',
      'camera-photo-accessories',
      'digital-cameras',
      'film-polaroid-cameras',
      'blu-ray',
      'cd',
      'dvd',
      'bluetooth-speakers',
      'docking-stations',
      'portable-stereos-boomboxes',
      'radios',
      'studio-recording-equipment',
      'televisions',
      'dvrs',
      'gadgets',
      'streaming-devices',
    ],
    parentCategory: [
      'kitchen-dining',
      'smart-home',
      'home-appliances',
      'furniture',
      'watches',
      'other',
    ],
  },
  {
    option: 'refurbished-good',
    label: 'Refurbished - Good',
    parentSubCategory: [
      'smartphones',
      'other',
      'computers-laptops',
      'gaming-pCs',
      'monitors-screens',
      'tablets-E-Readers',
      'consoles',
      'pC-gaming',
      'replacement-parts-tools',
      'fitness-trackers',
      'smart-watches',
      'headphones',
      'mP3-players',
      'camcorders',
      'camera-photo-accessories',
      'digital-cameras',
      'film-polaroid-cameras',
      'blu-ray',
      'cd',
      'dvd',
      'bluetooth-speakers',
      'docking-stations',
      'portable-stereos-boomboxes',
      'radios',
      'studio-recording-equipment',
      'televisions',
      'dvrs',
      'gadgets',
      'streaming-devices',
    ],
    parentCategory: [
      'kitchen-dining',
      'smart-home',
      'home-appliances',
      'furniture',
      'watches',
      'other',
    ],
  },
  {
    option: 'refurbished-pristine',
    label: 'Refurbished - Pristine',
    parentSubCategory: [
      'smartphones',
      'other',
      'computers-laptops',
      'gaming-pCs',
      'monitors-screens',
      'tablets-E-Readers',
      'consoles',
      'pC-gaming',
      'replacement-parts-tools',
      'fitness-trackers',
      'smart-watches',
      'headphones',
      'mP3-players',
      'camcorders',
      'camera-photo-accessories',
      'digital-cameras',
      'film-polaroid-cameras',
      'blu-ray',
      'cd',
      'dvd',
      'bluetooth-speakers',
      'docking-stations',
      'portable-stereos-boomboxes',
      'radios',
      'studio-recording-equipment',
      'televisions',
      'dvrs',
      'gadgets',
      'streaming-devices',
    ],
    parentCategory: [
      'kitchen-dining',
      'smart-home',
      'home-appliances',
      'furniture',
      'watches',
      'other',
    ],
  },
];

export const listingCompatible = [
  {
    option: 'not-specified',
    label: 'Not Specified',
    parentSubCategory: [
      'smart-watch-accessories',
      'games',
      'phone-accessories',
      'batteries',
      'screen-protectors',
      'other',
      'replacement-parts-tools',
    ],
    parentCategory: ['wearables', 'phone-accessories', 'video-games-consoles', 'computers-laptops'],
  },
  {
    option: 'samsung',
    label: 'Samsung',
    parentSubCategory: [
      'smart-watch-accessories',
      'phone-accessories',
      'batteries',
      'screen-protectors',
      'other',
    ],
    parentCategory: ['wearables', 'phone-accessories', 'computers-laptops'],
  },
  {
    option: 'lg',
    label: 'LG',
    parentSubCategory: ['phone-accessories', 'batteries', 'screen-protectors', 'other'],
    parentCategory: ['phone-accessories', 'computers-laptops'],
  },
  {
    option: 'universal',
    label: 'Universal',
    parentSubCategory: [
      'phone-accessories',
      'batteries',
      'screen-protectors',
      'other',
      'accessories',
    ],
    parentCategory: ['phone-accessories'],
  },
  {
    option: 'nokia',
    label: 'Nokia',
    parentSubCategory: ['phone-accessories', 'batteries', 'screen-protectors', 'other'],
    parentCategory: ['phone-accessories'],
  },
  {
    option: 'apple',
    label: 'Apple',
    parentSubCategory: [
      'smart-watch-accessories',
      'phone-accessories',
      'batteries',
      'screen-protectors',
      'other',
    ],
    parentCategory: ['wearables', 'phone-accessories', 'computers-laptops'],
  },
  {
    option: 'xiaomi',
    label: 'Xiaomi',
    parentSubCategory: [
      'smart-watch-accessories',
      'phone-accessories',
      'batteries',
      'screen-protectors',
      'other',
    ],
    parentCategory: ['wearables', 'phone-accessories'],
  },
  {
    option: 'sony',
    label: 'Sony',
    parentSubCategory: ['phone-accessories', 'batteries', 'screen-protectors', 'other'],
    parentCategory: ['phone-accessories', 'computers-laptops'],
  },
  {
    option: 'huawei',
    label: 'Huawei',
    parentSubCategory: [
      'smart-watch-accessories',
      'phone-accessories',
      'batteries',
      'screen-protectors',
      'other',
    ],
    parentCategory: ['wearables', 'phone-accessories', 'computers-laptops'],
  },
  {
    option: 'zte',
    label: 'ZTE',
    parentSubCategory: ['phone-accessories', 'batteries', 'screen-protectors', 'other'],
    parentCategory: ['phone-accessories'],
  },
  {
    option: 'htc',
    label: 'HTC',
    parentSubCategory: ['phone-accessories', 'batteries', 'screen-protectors', 'other'],
    parentCategory: ['phone-accessories'],
  },
  {
    option: 'alcatel',
    label: 'Alcatel',
    parentSubCategory: ['phone-accessories', 'batteries', 'screen-protectors', 'other'],
    parentCategory: ['phone-accessories'],
  },
  {
    option: 'redmi',
    label: 'redmi',
    parentSubCategory: ['phone-accessories', 'batteries', 'screen-protectors', 'other'],
    parentCategory: ['phone-accessories'],
  },
  {
    option: 'asus',
    label: 'ASUS',
    parentSubCategory: ['phone-accessories', 'batteries', 'screen-protectors', 'other'],
    parentCategory: ['phone-accessories', 'computers-laptops'],
  },
  {
    option: 'oppo',
    label: 'OPPO',
    parentSubCategory: ['phone-accessories', 'batteries', 'screen-protectors', 'other'],
    parentCategory: ['phone-accessories'],
  },
  {
    option: 'blackberry',
    label: 'Blackberry',
    parentSubCategory: ['phone-accessories', 'batteries', 'screen-protectors', 'other'],
    parentCategory: ['phone-accessories'],
  },
  {
    option: 'verizon',
    label: 'Verizon',
    parentSubCategory: ['phone-accessories', 'batteries', 'screen-protectors', 'other'],
    parentCategory: ['phone-accessories'],
  },

  {
    option: 'dell',
    label: 'Dell',
    parentSubCategory: ['other'],
    parentCategory: ['computers-laptops'],
  },
  {
    option: 'hp',
    label: 'HP',
    parentSubCategory: ['other'],
    parentCategory: ['computers-laptops'],
  },
  {
    option: 'lenovo',
    label: 'Lenovo',
    parentSubCategory: ['other'],
    parentCategory: ['computers-laptops'],
  },
  {
    option: 'msi',
    label: 'MSI',
    parentSubCategory: ['other'],
    parentCategory: ['computers-laptops'],
  },
  {
    option: 'microsoft-surface',
    label: 'Microsoft Surface',
    parentSubCategory: ['other'],
    parentCategory: ['computers-laptops'],
  },
  {
    option: 'toshiba',
    label: 'Toshiba',
    parentSubCategory: ['other'],
    parentCategory: ['computers-laptops'],
  },
  {
    option: 'fujitsu',
    label: 'Fujitsu',
    parentSubCategory: ['other'],
    parentCategory: ['computers-laptops'],
  },
  {
    option: 'acer',
    label: 'Acer',
    parentSubCategory: ['other'],
    parentCategory: ['computers-laptops'],
  },
  {
    option: 'google',
    label: 'Google',
    parentSubCategory: ['other'],
    parentCategory: ['computers-laptops'],
  },
  {
    option: 'medion',
    label: 'Medion',
    parentSubCategory: ['other'],
    parentCategory: ['computers-laptops'],
  },
  {
    option: 'packard-bell',
    label: 'Packard Bell',
    parentSubCategory: ['other'],
    parentCategory: ['computers-laptops'],
  },
  {
    option: 'panasonic',
    label: 'Panasonic',
    parentSubCategory: ['other'],
    parentCategory: ['computers-laptops'],
  },
  {
    option: 'alienware',
    label: 'Alienware',
    parentSubCategory: ['other'],
    parentCategory: ['computers-laptops'],
  },
  {
    option: 'clevo',
    label: 'Clevo',
    parentSubCategory: ['other'],
    parentCategory: ['computers-laptops'],
  },

  {
    option: 'playStation',
    label: 'PlayStation',
    parentSubCategory: ['accessories', 'games', 'replacement-parts-tools', 'other'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'xbox',
    label: 'Xbox',
    parentSubCategory: ['accessories', 'games', 'replacement-parts-tools', 'other'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'nintendo',
    label: 'Nintendo',
    parentSubCategory: ['accessories', 'games', 'replacement-parts-tools', 'other'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'sega',
    label: 'Sega',
    parentSubCategory: ['accessories', 'games', 'replacement-parts-tools', 'other'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'atari',
    label: 'Atari',
    parentSubCategory: ['accessories', 'games', 'replacement-parts-tools', 'other'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'SNK',
    label: 'SNK',
    parentSubCategory: ['accessories', 'games', 'replacement-parts-tools', 'other'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'commodore',
    label: 'Commodore',
    parentSubCategory: ['accessories', 'games', 'replacement-parts-tools', 'other'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'NEC',
    label: 'NEC',
    parentSubCategory: ['accessories', 'games', 'replacement-parts-tools', 'other'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'hyperkin',
    label: 'Hyperkin',
    parentSubCategory: ['accessories', 'games', 'replacement-parts-tools', 'other'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'analogue',
    label: 'Analogue',
    parentSubCategory: ['accessories', 'games', 'other'],
    parentCategory: ['video-games-consoles'],
  },

  {
    option: 'fitbit',
    label: 'Fitbit',
    parentSubCategory: ['smart-watch-accessories'],
    parentCategory: ['wearables'],
  },
  {
    option: 'garmin',
    label: 'Garmin',
    parentSubCategory: ['smart-watch-accessories'],
    parentCategory: ['wearables'],
  },
  {
    option: 'fossil',
    label: 'Fossil',
    parentSubCategory: ['smart-watch-accessories'],
    parentCategory: ['wearables'],
  },
  {
    option: 'withings',
    label: 'Withings',
    parentSubCategory: ['smart-watch-accessories'],
    parentCategory: ['wearables'],
  },
  {
    option: 'amazfit',
    label: 'Amazfit',
    parentSubCategory: ['smart-watch-accessories'],
    parentCategory: ['wearables'],
  },
  {
    option: 'ticWatch',
    label: 'TicWatch',
    parentSubCategory: ['smart-watch-accessories'],
    parentCategory: ['wearables'],
  },
];

export const listingCapacities = [
  {
    option: 'not-specified',
    label: 'Not Specified',
    parentSubCategory: ['batteries', 'computers-laptops', 'gaming-pCs', 'tablets-E-Readers'],
    parentCategory: ['phone-accessories', 'computers-laptops', 'tablets-E-Readers'],
  },
  {
    option: '1000-2999 mAh',
    label: '1000-2999 mAh',
    parentSubCategory: ['batteries'],
    parentCategory: ['phone-accessories'],
  },
  {
    option: '3000-4999 mAh',
    label: '3000-4999 mAh',
    parentSubCategory: ['batteries'],
    parentCategory: ['phone-accessories'],
  },
  {
    option: 'Less than 1000 mAh',
    label: 'Less than 1000 mAh',
    parentSubCategory: ['batteries'],
    parentCategory: ['phone-accessories'],
  },
  {
    option: '5000-10000 mAh',
    label: '5000-10000 mAh',
    parentSubCategory: ['batteries'],
    parentCategory: ['phone-accessories'],
  },
  {
    option: 'More than 10000 mAh',
    label: 'More than 10000 mAh',
    parentSubCategory: ['batteries'],
    parentCategory: ['phone-accessories'],
  },
  {
    option: '20100 mAh',
    label: '20100 mAh',
    parentSubCategory: ['batteries'],
    parentCategory: ['phone-accessories'],
  },

  {
    option: '1 GB',
    label: '1 GB',
    parentSubCategory: ['computers-laptops', 'gaming-pCs'],
    parentCategory: ['computers-laptops'],
  },
  {
    option: '2 GB',
    label: '2 GB',
    parentSubCategory: ['computers-laptops', 'gaming-pCs'],
    parentCategory: ['computers-laptops'],
  },
  {
    option: '3 GB',
    label: '3 GB',
    parentSubCategory: ['computers-laptops', 'gaming-pCs'],
    parentCategory: ['computers-laptops'],
  },
  {
    option: '4 GB',
    label: '4 GB',
    parentSubCategory: ['computers-laptops', 'gaming-pCs'],
    parentCategory: ['computers-laptops'],
  },
  {
    option: '5 GB',
    label: '5 GB',
    parentSubCategory: ['computers-laptops', 'gaming-pCs'],
    parentCategory: ['computers-laptops'],
  },
  {
    option: '6 GB',
    label: '6 GB',
    parentSubCategory: ['computers-laptops', 'gaming-pCs'],
    parentCategory: ['computers-laptops'],
  },
  {
    option: '7 GB',
    label: '7 GB',
    parentSubCategory: ['computers-laptops', 'gaming-pCs'],
    parentCategory: ['computers-laptops'],
  },
  {
    option: '8 GB',
    label: '8 GB',
    parentSubCategory: ['computers-laptops', 'gaming-pCs'],
    parentCategory: ['computers-laptops', 'computers-laptops'],
  },
  {
    option: '9 GB',
    label: '9 GB',
    parentSubCategory: ['computers-laptops', 'gaming-pCs'],
    parentCategory: ['computers-laptops'],
  },
  {
    option: '10 GB',
    label: '10 GB',
    parentSubCategory: ['computers-laptops', 'gaming-pCs'],
    parentCategory: ['computers-laptops'],
  },
  {
    option: '12 GB',
    label: '12 GB',
    parentSubCategory: ['computers-laptops', 'gaming-pCs'],
    parentCategory: ['computers-laptops'],
  },

  {
    option: '24 GB',
    label: '24 GB',
    parentSubCategory: ['computers-laptops', 'gaming-pCs'],
    parentCategory: ['computers-laptops'],
  },
  {
    option: '32 GB',
    label: '32 GB',
    parentSubCategory: ['computers-laptops', 'gaming-pCs'],
    parentCategory: ['computers-laptops'],
  },
  {
    option: '64 GB',
    label: '64 GB',
    parentSubCategory: ['computers-laptops', 'gaming-pCs'],
    parentCategory: ['computers-laptops'],
  },
  {
    option: '128 GB',
    label: '128 GB',
    parentSubCategory: ['computers-laptops', 'gaming-pCs'],
    parentCategory: ['computers-laptops'],
  },
  {
    option: '256 GB',
    label: '256 GB',
    parentSubCategory: ['computers-laptops', 'gaming-pCs'],
    parentCategory: ['computers-laptops'],
  },
  {
    option: '512 GB',
    label: '512 GB',
    parentSubCategory: ['computers-laptops', 'gaming-pCs'],
    parentCategory: ['computers-laptops'],
  },
  {
    option: '1 TB',
    label: '1 TB',
    parentSubCategory: ['computers-laptops', 'gaming-pCs'],
    parentCategory: ['computers-laptops'],
  },
  {
    option: '2 TB',
    label: '2 TB',
    parentSubCategory: ['computers-laptops', 'gaming-pCs'],
    parentCategory: ['computers-laptops'],
  },

  {
    option: '128 MB',
    label: '128 MB',
    parentSubCategory: ['tablets-E-Readers'],
    parentCategory: ['tablets-E-Readers'],
  },
  {
    option: '16 GB',
    label: '16 GB',
    parentSubCategory: ['tablets-E-Readers'],
    parentCategory: ['tablets-E-Readers'],
  },
  {
    option: '2 GB',
    label: '2 GB',
    parentSubCategory: ['tablets-E-Readers'],
    parentCategory: ['tablets-E-Readers'],
  },
  {
    option: '3 GB',
    label: '3 GB',
    parentSubCategory: ['tablets-E-Readers'],
    parentCategory: ['tablets-E-Readers'],
  },
  {
    option: '4 GB',
    label: '4 GB',
    parentSubCategory: ['tablets-E-Readers'],
    parentCategory: ['tablets-E-Readers'],
  },
  {
    option: '8 GB',
    label: '8 GB',
    parentSubCategory: ['tablets-E-Readers'],
    parentCategory: ['tablets-E-Readers'],
  },

  {
    option: 'playStation',
    label: 'PlayStation',
    parentSubCategory: ['accessories', 'games', 'replacement-parts-tools', 'other'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'xbox',
    label: 'Xbox',
    parentSubCategory: ['accessories', 'games', 'replacement-parts-tools', 'other'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'nintendo',
    label: 'Nintendo',
    parentSubCategory: ['accessories', 'games', 'replacement-parts-tools', 'other'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'sega',
    label: 'Sega',
    parentSubCategory: ['accessories', 'games', 'replacement-parts-tools', 'other'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'atari',
    label: 'Atari',
    parentSubCategory: ['accessories', 'games', 'replacement-parts-tools', 'other'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'SNK',
    label: 'SNK',
    parentSubCategory: ['accessories', 'games', 'replacement-parts-tools', 'other'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'commodore',
    label: 'Commodore',
    parentSubCategory: ['accessories', 'games', 'replacement-parts-tools', 'other'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'NEC',
    label: 'NEC',
    parentSubCategory: ['accessories', 'games', 'replacement-parts-tools', 'other'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'hyperkin',
    label: 'Hyperkin',
    parentSubCategory: ['accessories', 'games', 'replacement-parts-tools', 'other'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'analogue',
    label: 'Analogue',
    parentSubCategory: ['accessories', 'games', 'other'],
    parentCategory: ['video-games-consoles'],
  },

  {
    option: 'fitbit',
    label: 'Fitbit',
    parentSubCategory: ['smart-watch-accessories'],
    parentCategory: ['wearables'],
  },
  {
    option: 'garmin',
    label: 'Garmin',
    parentSubCategory: ['smart-watch-accessories'],
    parentCategory: ['wearables'],
  },
  {
    option: 'fossil',
    label: 'Fossil',
    parentSubCategory: ['smart-watch-accessories'],
    parentCategory: ['wearables'],
  },
  {
    option: 'withings',
    label: 'Withings',
    parentSubCategory: ['smart-watch-accessories'],
    parentCategory: ['wearables'],
  },
  {
    option: 'amazfit',
    label: 'Amazfit',
    parentSubCategory: ['smart-watch-accessories'],
    parentCategory: ['wearables'],
  },
  {
    option: 'ticWatch',
    label: 'TicWatch',
    parentSubCategory: ['smart-watch-accessories'],
    parentCategory: ['wearables'],
  },
];

export const listingMaterials = [
  { option: 'not-specified', label: 'Not Specified', parentSubCategory: ['screen-protectors'] },
  { option: 'Acrylic', label: 'Acrylic', parentSubCategory: ['screen-protectors'] },
  { option: 'Carbon Fibre', label: 'Carbon Fibre', parentSubCategory: ['screen-protectors'] },
  { option: 'Faux Leather', label: 'Faux Leather', parentSubCategory: ['screen-protectors'] },
  { option: 'Hydrogel', label: 'Hydrogel', parentSubCategory: ['screen-protectors'] },
  { option: 'Liquid Glass', label: 'Liquid Glass', parentSubCategory: ['screen-protectors'] },
  {
    option: 'Nano Liquid Glass',
    label: 'Nano Liquid Glass',
    parentSubCategory: ['screen-protectors'],
  },
  { option: 'Neoprene', label: 'Neoprene', parentSubCategory: ['screen-protectors'] },
  { option: 'PET', label: 'PET', parentSubCategory: ['screen-protectors'] },
  { option: 'Plastic', label: 'Plastic', parentSubCategory: ['screen-protectors'] },
  { option: 'Polycarbonate', label: 'Polycarbonate', parentSubCategory: ['screen-protectors'] },
  { option: 'Polyester', label: 'Polyester', parentSubCategory: ['screen-protectors'] },
  { option: 'Tempered Glass', label: 'Tempered Glass', parentSubCategory: ['screen-protectors'] },
  {
    option: 'Tinned Pure Copper (T*Cu)',
    label: 'Tinned Pure Copper (T*Cu)',
    parentSubCategory: ['screen-protectors'],
  },
  { option: 'TPU', label: 'TPU', parentSubCategory: ['screen-protectors'] },
];

//smartphones

export const listingModels = [
  {
    option: 'not-specified',
    label: 'Not Specified',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: '3DO',
    label: '3DO',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: '3DO FZ-10',
    label: '3DO FZ-10',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Amstrad GX4000',
    label: 'Amstrad GX4000',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Apple Bandai Pippin',
    label: 'Apple Bandai Pippin',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Atari 2600',
    label: 'Atari 2600',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Atari Jaguar',
    label: 'Atari Jaguar',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Atari Jaguar CD',
    label: 'Atari Jaguar CD',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Atari Lynx',
    label: 'Atari Lynx',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Atari XEGS',
    label: 'Atari XEGS',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Bandai WonderSwan',
    label: 'Bandai WonderSwan',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Bandai WonderSwan Color',
    label: 'Bandai WonderSwan Color',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'C64 Mini',
    label: 'C64 Mini',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'ColecoVision',
    label: 'ColecoVision',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Commodore 64',
    label: 'Commodore 64',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Commodore Amiga CD32',
    label: 'Commodore Amiga CD32',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Interton VC 4000',
    label: 'Interton VC 4000',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Mad Catz M.O.J.O.',
    label: 'Mad Catz M.O.J.O.',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Magnavox Odyssey',
    label: 'Magnavox Odyssey',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Master System II',
    label: 'Master System II',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Mega-CD II',
    label: 'Mega-CD II',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Microsoft Xbox',
    label: 'Microsoft Xbox',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Microsoft Xbox 360',
    label: 'Microsoft Xbox 360',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Microsoft Xbox 360 Arcade',
    label: 'Microsoft Xbox 360 Arcade',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Microsoft Xbox 360 Core',
    label: 'Microsoft Xbox 360 Core',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Microsoft Xbox 360 E',
    label: 'Microsoft Xbox 360 E',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Microsoft Xbox 360 Elite',
    label: 'Microsoft Xbox 360 Elite',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Microsoft Xbox 360 Premium',
    label: 'Microsoft Xbox 360 Premium',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Microsoft Xbox 360 Pro',
    label: 'Microsoft Xbox 360 Pro',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Microsoft Xbox 360 S',
    label: 'Microsoft Xbox 360 S',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Microsoft Xbox One',
    label: 'Microsoft Xbox One',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Microsoft Xbox One S',
    label: 'Microsoft Xbox One S',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Microsoft Xbox One X',
    label: 'Microsoft Xbox One X',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Microsoft Xbox Series S',
    label: 'Microsoft Xbox Series S',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Microsoft Xbox Series X',
    label: 'Microsoft Xbox Series X',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'NEC PC-FX',
    label: 'NEC PC-FX',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Neo Geo AES',
    label: 'Neo Geo AES',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Neo Geo Mini',
    label: 'Neo Geo Mini',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Neo Geo Pocket',
    label: 'Neo Geo Pocket',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Neo Geo Pocket Color',
    label: 'Neo Geo Pocket Color',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'New Nintendo 2DS XL',
    label: 'New Nintendo 2DS XL',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'New Nintendo 3DS',
    label: 'New Nintendo 3DS',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'New Nintendo 3DS LL',
    label: 'New Nintendo 3DS LL',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'New Nintendo 3DS XL',
    label: 'New Nintendo 3DS XL',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Nintendo 2DS',
    label: 'Nintendo 2DS',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Nintendo 2DS LL',
    label: 'Nintendo 2DS LL',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Nintendo 3DS',
    label: 'Nintendo 3DS',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Nintendo 3DS XL',
    label: 'Nintendo 3DS XL',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Nintendo 64',
    label: 'Nintendo 64',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Nintendo DS',
    label: 'Nintendo DS',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Nintendo DSi',
    label: 'Nintendo DSi',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Nintendo DSi XL',
    label: 'Nintendo DSi XL',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Nintendo DS Lite',
    label: 'Nintendo DS Lite',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Nintendo Game Boy',
    label: 'Nintendo Game Boy',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Nintendo Game Boy Advance',
    label: 'Nintendo Game Boy Advance',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Nintendo Game Boy Advance SP',
    label: 'Nintendo Game Boy Advance SP',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Nintendo Game Boy Color',
    label: 'Nintendo Game Boy Color',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Nintendo Game Boy Light',
    label: 'Nintendo Game Boy Light',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Nintendo Game Boy Micro',
    label: 'Nintendo Game Boy Micro',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Nintendo Game Boy Pocket',
    label: 'Nintendo Game Boy Pocket',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Nintendo GameCube',
    label: 'Nintendo GameCube',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Nintendo NES',
    label: 'Nintendo NES',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Nintendo NES Classic Edition',
    label: 'Nintendo NES Classic Edition',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Nintendo Retro Duo Portable (RDP)',
    label: 'Nintendo Retro Duo Portable (RDP)',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Nintendo SNES',
    label: 'Nintendo SNES',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Nintendo Super NES Classic Edition',
    label: 'Nintendo Super NES Classic Edition',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Nintendo Switch',
    label: 'Nintendo Switch',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Nintendo Switch (OLED Model)',
    label: 'Nintendo Switch (OLED Model)',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Nintendo Switch Lite',
    label: 'Nintendo Switch Lite',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Nintendo Wii',
    label: 'Nintendo Wii',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Nintendo Wii mini',
    label: 'Nintendo Wii mini',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Nintendo Wii U - Basic',
    label: 'Nintendo Wii U - Basic',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Nintendo Wii U - Deluxe',
    label: 'Nintendo Wii U - Deluxe',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Not Applicable',
    label: 'Not Applicable',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'NVIDIA Shield Portable',
    label: 'NVIDIA Shield Portable',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },

  {
    option: 'Philips CD-i',
    label: 'Philips CD-i',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'PSP-3001',
    label: 'PSP-3001',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'S192K',
    label: 'S192K',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Sega Genesis 3',
    label: 'Sega Genesis 3',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Sega Genesis II',
    label: 'Sega Genesis II',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Sega Mega-CD',
    label: 'Sega Mega-CD',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Sega Mega Drive',
    label: 'Sega Mega Drive',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Sega Mega Drive 32X',
    label: 'Sega Mega Drive 32X',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Sega Mega Drive II',
    label: 'Sega Mega Drive II',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Sega Mega Drive Mini',
    label: 'Sega Mega Drive Mini',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },

  {
    option: 'Sega Multi-Mega',
    label: 'Sega Multi-Mega',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Sega SG-1000',
    label: 'Sega SG-1000',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Sony PlayStation 1',
    label: 'Sony PlayStation 1',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Sony PlayStation 2',
    label: 'Sony PlayStation 2',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Sony PlayStation 2 - Slim',
    label: 'Sony PlayStation 2 - Slim',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Sony PlayStation 3',
    label: 'Sony PlayStation 3',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Sony PlayStation 3 - Slim',
    label: 'Sony PlayStation 3 - Slim',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Sony PlayStation 3 - Super Slim',
    label: 'Sony PlayStation 3 - Super Slim',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Sony PlayStation 4',
    label: 'Sony PlayStation 4',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Sony PlayStation 4 Pro',
    label: 'Sony PlayStation 4 Pro',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Sony PlayStation 4 Slim',
    label: 'Sony PlayStation 4 Slim',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Sony PlayStation 5 Blu-Ray Edition',
    label: 'Sony PlayStation 5 Blu-Ray Edition',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Sony PlayStation 5 Digital Edition',
    label: 'Sony PlayStation 5 Digital Edition',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Sony PlayStation 5 Slim Blu-Ray Edition',
    label: 'Sony PlayStation 5 Slim Blu-Ray Edition',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Sony PlayStation 5 Slim Digital Edition',
    label: 'Sony PlayStation 5 Slim Digital Edition',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Sony PlayStation Classic',
    label: 'Sony PlayStation Classic',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },

  {
    option: 'Sony PlayStation Portable',
    label: 'Sony PlayStation Portable',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Sony PSP-1000',
    label: 'Sony PSP-1000',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Sony PSP-1001',
    label: 'Sony PSP-1001',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Sony PSP-2000',
    label: 'Sony PSP-2000',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Sony PSP-3000',
    label: 'Sony PSP-3000',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Sony PSP-E1000',
    label: 'Sony PSP-E1000',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Sony PS Vita - PCH-1000',
    label: 'Sony PS Vita - PCH-1000',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },

  {
    option: 'Sony PS Vita - PCH-1001',
    label: 'Sony PS Vita - PCH-1001',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Sony PS Vita - PCH-1101',
    label: 'Sony PS Vita - PCH-1101',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Sony PS Vita - PCH-2000',
    label: 'Sony PS Vita - PCH-2000',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Sony PS Vita PCH-2001',
    label: 'Sony PS Vita PCH-2001',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'SwanCrystal',
    label: 'SwanCrystal',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'TurboExpress',
    label: 'TurboExpress',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'TurboGrafx-16 (PC Engine)',
    label: 'TurboGrafx-16 (PC Engine)',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'TurboGrafx-CD/TurboDuo',
    label: 'TurboGrafx-CD/TurboDuo',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Valve Steam Deck',
    label: 'Valve Steam Deck',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
  {
    option: 'Vectrex',
    label: 'Vectrex',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },

  {
    option: 'Watara Supervision',
    label: 'Watara Supervision',
    parentSubCategory: ['consoles'],
    parentCategory: ['video-games-consoles'],
  },
];

export const listingFields = [
         {
           key: 'category',
           scope: 'public',
           schemaType: 'enum',
           enumOptions: listingCategories,
           filterConfig: {
             indexForSearch: true,
             filterType: 'SelectMultipleFilter',
             label: 'Category',
             group: 'primary',
           },
           showConfig: {
             label: 'Category',
             isDetail: true,
           },
           saveConfig: {
             label: 'Category',
             placeholderMessage: 'Select an option…',
             isRequired: true,
             requiredMessage: 'You need to select a category.',
           },
         },
         {
           key: 'subCategory',
           scope: 'public',
           schemaType: 'enum',
           enumOptions: listingSubCategories,
           filterConfig: {
             indexForSearch: true,
             filterType: 'SelectMultipleFilter',
             label: 'Sub Category',
             group: 'primary',
           },
           showConfig: {
             label: 'Sub Category',
             isDetail: true,
           },
           saveConfig: {
             label: 'Sub Category',
             placeholderMessage: 'Select an option…',
             isRequired: true,
             requiredMessage: 'You need to select a category.',
           },
         },
         {
          key: 'subCategoryChild',
          scope: 'public',
          schemaType: 'enum',
          enumOptions: listingSubCategoriesChild,
          filterConfig: {
            indexForSearch: true,
            filterType: 'SelectMultipleFilter',
            label: 'Type',
            group: 'primary',
          },
          showConfig: {
            label: 'Type',
            isDetail: true,
          },
          saveConfig: {
            label: 'Type',
            placeholderMessage: 'Select an option…',
            isRequired: true,
            requiredMessage: 'You need to select a category.',
          },
        },
         {
           key: 'condition',
           scope: 'public',
           schemaType: 'enum',
           enumOptions: listingConditions,
           filterConfig: {
             indexForSearch: true,
             filterType: 'SelectMultipleFilter',
             label: 'Condition',
             group: 'primary',
           },
           showConfig: {
             label: 'Condition',
             isDetail: true,
           },
           saveConfig: {
             label: 'Condition',
             placeholderMessage: 'Select an option…',
             isRequired: true,
             requiredMessage: 'You need to select a tire size.',
           },
         },
         // {
         //   key: 'brand',
         //   scope: 'public',
         //   schemaType: 'enum',
         //   enumOptions: [
         //     { option: 'cube', label: 'Cube' },
         //     { option: 'diamant', label: 'Diamant' },
         //     { option: 'ghost', label: 'GHOST' },
         //     { option: 'giant', label: 'Giant' },
         //     { option: 'kalkhoff', label: 'Kalkhoff' },
         //     { option: 'kona', label: 'Kona' },
         //     { option: 'otler', label: 'Otler' },
         //     { option: 'vermont', label: 'Vermont' },
         //   ],
         //   filterConfig: {
         //     indexForSearch: true,
         //     label: 'Brand',
         //     group: 'secondary',
         //   },
         //   showConfig: {
         //     label: 'Brand',
         //     isDetail: true,
         //   },
         //   saveConfig: {
         //     label: 'Brand',
         //     placeholderMessage: 'Select an option…',
         //     isRequired: true,
         //     requiredMessage: 'You need to select a brand.',
         //   },
         // },
         // {
         //   key: 'accessories',
         //   scope: 'public',
         //   schemaType: 'multi-enum',
         //   enumOptions: [
         //     { option: 'bell', label: 'Bell' },
         //     { option: 'lights', label: 'Lights' },
         //     { option: 'lock', label: 'Lock' },
         //     { option: 'mudguard', label: 'Mudguard' },
         //   ],
         //   filterConfig: {
         //     indexForSearch: true,
         //     label: 'Accessories',
         //     searchMode: 'has_all',
         //     group: 'secondary',
         //   },
         //   showConfig: {
         //     label: 'Accessories',
         //   },
         //   saveConfig: {
         //     label: 'Accessories',
         //     placeholderMessage: 'Select an option…',
         //     isRequired: false,
         //   },
         // },

         // // An example of how to use transaction type specific custom fields and private data.
         // {
         //   key: 'note',
         //   scope: 'public',
         //   includeForListingTypes: ['product-selling'],
         //   schemaType: 'text',
         //   showConfig: {
         //     label: 'Extra notes',
         //   },
         //   saveConfig: {
         //     label: 'Extra notes',
         //     placeholderMessage: 'Some public extra note about this bike...',
         //   },
         // },
         // {
         //   key: 'privatenote',
         //   scope: 'private',
         //   includeForListingTypes: ['daily-booking'],
         //   schemaType: 'text',
         //   saveConfig: {
         //     label: 'Private notes',
         //     placeholderMessage: 'Some private note about this bike...',
         //   },
         // },
       ];

///////////////////////////////////////////////////////////////////////
// Configurations related to listing types and transaction processes //
///////////////////////////////////////////////////////////////////////

// A presets of supported listing configurations
//
// Note 1: The listingTypes come from listingTypes asset nowadays by default.
//         To use this built-in configuration, you need to change the overwrite from configHelper.js
//         (E.g. use mergeDefaultTypesAndFieldsForDebugging func)
// Note 2: transaction type is part of listing type. It defines what transaction process and units
//         are used when transaction is created against a specific listing.

/**
 * Configuration options for listing experience:
 * - listingType:         Unique string. This will be saved to listing's public data on
 *                        EditListingWizard.
 * - label                Label for the listing type. Used as microcopy for options to select
 *                        listing type in EditListingWizard.
 * - transactionType      Set of configurations how this listing type will behave when transaction is
 *                        created.
 *   - process              Transaction process.
 *                          The process must match one of the processes that this client app can handle
 *                          (check src/util/transactions/transaction.js) and the process must also exists in correct
 *                          marketplace environment.
 *   - alias                Valid alias for the aforementioned process. This will be saved to listing's
 *                          public data as transctionProcessAlias and transaction is initiated with this.
 *   - unitType             Unit type is mainly used as pricing unit. This will be saved to
 *                          transaction's protected data.
 *                          Recommendation: don't use same unit types in completely different processes
 *                          ('item' sold should not be priced the same as 'item' booked).
 * - stockType            This is relevant only to listings using default-purchase process.
 *                        If set to 'oneItem', stock management is not showed and the listing is
 *                        considered unique (stock = 1).
 *                        Possible values: 'oneItem' and 'multipleItems'.
 *                        Default: 'multipleItems'.
 * - defaultListingFields These are tied to transaction processes. Different processes have different flags.
 *                        E.g. default-inquiry can toggle price and location to true/false value to indicate,
 *                        whether price (or location) tab should be shown. If defaultListingFields.price is not
 *                        explicitly set to _false_, price will be shown.
 *                        If the location or pickup is not used, listing won't be returned with location search.
 *                        Use keyword search as main search type if location is not enforced.
 *                        The payoutDetails flag allows provider to bypass setting of payout details.
 *                        Note: customers can't order listings, if provider has not set payout details! Monitor
 *                        providers who have not set payout details and contact them to ensure that they add the details.
 */

export const listingTypes = [
  {
    listingType: 'daily-booking',
    label: 'Daily booking',
    transactionType: {
      process: 'default-booking',
      alias: 'default-booking/release-1',
      unitType: 'day',
    },
    defaultListingFields: {
      location: true,
      payoutDetails: true,
    },
  },
  // // Here are some examples for other listingTypes
  // // TODO: SearchPage does not work well if both booking and product selling are used at the same time
  // {
  //   listingType: 'nightly-booking',
  //   label: 'Nightly booking',
  //   transactionType: {
  //     process: 'default-booking',
  //     alias: 'default-booking/release-1',
  //     unitType: 'night',
  //   },
  // },
  // {
  //   listingType: 'hourly-booking',
  //   label: 'Hourly booking',
  //   transactionType: {
  //     process: 'default-booking',
  //     alias: 'default-booking/release-1',
  //     unitType: 'hour',
  //   },
  // },
  // {
  //   listingType: 'product-selling',
  //   label: 'Sell bicycles',
  //   transactionType: {
  //     process: 'default-purchase',
  //     alias: 'default-purchase/release-1',
  //     unitType: 'item',
  //   },
  //   stockType: 'multipleItems',
  //   defaultListingFields: {
  //     shipping: true,
  //     pickup: true,
  //     payoutDetails: true,
  //   },
  // },
  // {
  //   listingType: 'inquiry',
  //   label: 'Inquiry',
  //   transactionType: {
  //     process: 'default-inquiry',
  //     alias: 'default-inquiry/release-1',
  //     unitType: 'inquiry',
  //   },
  //   defaultListingFields: {
  //     price: false,
  //     location: true,
  //   },
  // },
];

// SearchPage can enforce listing query to only those listings with valid listingType
// However, it only works if you have set 'enum' type search schema for the public data fields
//   - listingType
//
//  Similar setup could be expanded to 2 other extended data fields:
//   - transactionProcessAlias
//   - unitType
//
// Read More:
// https://www.sharetribe.com/docs/how-to/manage-search-schemas-with-flex-cli/#adding-listing-search-schemas
export const enforceValidListingType = false;
