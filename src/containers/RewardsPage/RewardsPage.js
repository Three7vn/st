import React, { useState, useRef, useEffect } from 'react';
import { Button, H3, H5, LayoutSingleColumn, ListingCard, Modal, Page } from '../../components';
import TopbarContainer from '../TopbarContainer/TopbarContainer';
import FooterContainer from '../FooterContainer/FooterContainer';
import { FormattedMessage } from '../../util/reactIntl';
import { isScrollingDisabled } from '../../ducks/ui.duck';
import { useDispatch, useSelector } from 'react-redux';
import Slider from 'react-slick';
import css from './RewardsPage.module.css';
import WheelComponent from '../../components/WheelComponent/WheelComponent';

import noRewardPic from '../../assets/noReward.png';
import Uber from '../../assets/uber.png';
import Spotify from '../../assets/spotify.png';
import Stoado from '../../assets/stoado.png';
import {
  earnedPoints,
  fetchVouchers,
  getRewardsPoint,
  offPlatformRewardEmailToAdmin,
  offPlatformRewardEmailToUser,
  platformRewardEmailToAdmin,
  updateRedeemedVouchersHistoryPoints,
} from '../../util/api';

function RewardsPage(props) {
  const state = useSelector(state => state);
  const [vouchers, setVouchers] = useState([]);
  const [showButton, setShowButton] = useState(true);
  const { currentUser } = state.user;
  const slider1 = useRef(null);
  const slider2 = useRef(null);
  const userName = currentUser?.attributes?.profile?.publicData?.userName || '';
  const userId = currentUser?.id?.uuid || '';
  const planName = currentUser?.attributes?.profile?.publicData?.freePlanData?.planName || '';

  const { rewardsWallet, pointsOnHold, spin } = currentUser?.attributes?.profile?.publicData || {};
  const [remainingRewards, setRemainingRewards] = useState(rewardsWallet);
  const [remainingSpin, setRemainingSpin] = useState(spin);

  useEffect(() => {
    fetchVouchers().then(res => setVouchers(res));
  }, []);

  useEffect(() => {
    setRemainingRewards(rewardsWallet);
  }, [rewardsWallet]);

  useEffect(() => {
    setRemainingSpin(spin);
  }, [spin]);

  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [spinResult, setSpinResult] = useState(null);
  const [isSpinModalOpen, setIsSpinModalOpen] = useState(false);
  const [spinNow, setSpinNow] = useState(false);

  const wheelRef = useRef(null); // Add a reference to WheelComponent

  const segments =
    planName === 'member-plan' || planName === 'business-enterprise'
      ? [
          { segment: 'Another spin', probability: 14.4, voucherType: 'no-voucher' },
          { segment: 'No rewards', probability: 18, voucherType: 'no-voucher' },
          {
            segment: 'Uber £5',
            probability: 6,
            voucherType: 'off-platform',
            voucherName: 'Uber £5',
            imgUrl:
              'https://res.cloudinary.com/stoado/image/upload/v1718109952/Vouchers/UberVoucher_ik9ix3.png',
          },
          {
            segment: 'Uber £20',
            probability: 3.6,
            voucherType: 'off-platform',
            voucherName: 'Uber £20',
            imgUrl:
              'https://res.cloudinary.com/stoado/image/upload/v1718109952/Vouchers/UberVoucher_ik9ix3.png',
          },
          {
            segment: 'Restaurant £50',
            probability: 0.96,
            voucherType: 'off-platform',
            voucherName: 'Restaurant £50',
            imgUrl:
              'https://res.cloudinary.com/stoado/image/upload/v1718194489/Vouchers/resturant_ezeeha.png',
          },
          {
            segment: 'Netflix £10',
            probability: 7.2,
            voucherType: 'off-platform',
            voucherName: 'Netflix £10',
            imgUrl:
              'https://res.cloudinary.com/stoado/image/upload/v1718173593/Vouchers/netflix_qwfbtk.png',
          },
          {
            segment: 'Spotify £10',
            probability: 9.6,
            voucherType: 'off-platform',
            voucherName: 'Spotify £10',
            imgUrl:
              'https://res.cloudinary.com/stoado/image/upload/v1718193585/Vouchers/spotify_zm3jvk.jpg',
          },
          {
            segment: '5% off order',
            probability: 14.4,
            voucherType: 'platform',
            voucherName: '5% off order',
            isSellingFees: false,
            imgUrl:
              'https://res.cloudinary.com/stoado/image/upload/v1718173786/Vouchers/stoado_ygaw0f.png',
          },
          {
            segment: '10% off order',
            probability: 7.2,
            voucherType: 'platform',
            voucherName: '10% off order',
            isSellingFees: false,
            imgUrl:
              'https://res.cloudinary.com/stoado/image/upload/v1718173786/Vouchers/stoado_ygaw0f.png',
          },
          {
            segment: '20% off order',
            probability: 6,
            voucherType: 'platform',
            voucherName: '20% off order',
            isSellingFees: false,
            imgUrl:
              'https://res.cloudinary.com/stoado/image/upload/v1718173786/Vouchers/stoado_ygaw0f.png',
          },
          { segment: '8 points', probability: 12.5, voucherType: 'points', voucherName: '8 points' },
          {
            segment: '13 points',
            probability: 9.6,
            voucherType: 'points',
            voucherName: '13 points',
          },
          {
            segment: '24 points',
            probability: 6,
            voucherType: 'points',
            voucherName: '24 points',
          },
          {
            segment: '37 points',
            probability: 3.6,
            voucherType: 'points',
            voucherName: '37 points',
          },
          {
            segment: '5 Voucher',
            probability: 8.4,
            voucherType: 'platform',
            voucherName: '5 Voucher',
            imgUrl:
              'https://res.cloudinary.com/stoado/image/upload/v1718173786/Vouchers/stoado_ygaw0f.png',
            isSellingFees: false,
          },
          {
            segment: '10 Voucher',
            probability: 6,
            voucherType: 'platform',
            voucherName: '10 Voucher',
            imgUrl:
              'https://res.cloudinary.com/stoado/image/upload/v1718173786/Vouchers/stoado_ygaw0f.png',
            isSellingFees: false,
          },
          {
            segment: '50 Voucher',
            probability: 1.2,
            voucherType: 'platform',
            voucherName: '50 Voucher',
            imgUrl:
              'https://res.cloudinary.com/stoado/image/upload/v1718173786/Vouchers/stoado_ygaw0f.png',
            isSellingFees: false,
          },
          {
            segment: '100 Voucher',
            probability: 0.6,
            voucherType: 'platform',
            voucherName: '100 Voucher',
            imgUrl:
              'https://res.cloudinary.com/stoado/image/upload/v1718173786/Vouchers/stoado_ygaw0f.png',
            isSellingFees: false,
          },
          {
            segment: '20% off selling fees',
            probability: 1.44,
            voucherType: 'platform',
            voucherName: '20% off selling fees',
            imgUrl:
              'https://res.cloudinary.com/stoado/image/upload/v1718173786/Vouchers/stoado_ygaw0f.png',
            isSellingFees: true,
          },
          {
            segment: '60% off selling fees',
            probability: 1.2,
            voucherType: 'platform',
            voucherName: '60% off selling fees',
            imgUrl:
              'https://res.cloudinary.com/stoado/image/upload/v1718173786/Vouchers/stoado_ygaw0f.png',
            isSellingFees: true,
          },
        ]
      : [
          {
            segment: 'Another spin',
            probability: 12,
            voucherType: 'no-voucher',
            voucherName: 'Another spin',
          },
          {
            segment: 'No rewards',
            probability: 15,
            voucherType: 'no-voucher',
            voucherName: 'No rewards',
          },
          {
            segment: 'Uber £5',
            probability: 5,
            voucherType: 'off-platform',
            voucherName: 'Uber £5',
            imgUrl:
              'https://res.cloudinary.com/stoado/image/upload/v1718109952/Vouchers/UberVoucher_ik9ix3.png',
          },
          {
            segment: 'Uber £20',
            probability: 3,
            voucherType: 'off-platform',
            voucherName: 'Uber £20',
            imgUrl:
              'https://res.cloudinary.com/stoado/image/upload/v1718109952/Vouchers/UberVoucher_ik9ix3.png',
          },
          {
            segment: 'Restaurant £50',
            probability: 0.8,
            voucherType: 'off-platform',
            voucherName: 'Restaurant £50',
            imgUrl:
              'https://res.cloudinary.com/stoado/image/upload/v1718194489/Vouchers/resturant_ezeeha.png',
          },
          {
            segment: 'Netflix £10',
            probability: 6,
            voucherType: 'off-platform',
            voucherName: 'Netflix £10',
            imgUrl:
              'https://res.cloudinary.com/stoado/image/upload/v1718173593/Vouchers/netflix_qwfbtk.png',
          },
          {
            segment: 'Spotify £10',
            probability: 8,
            voucherType: 'off-platform',
            voucherName: 'Spotify £10',
            imgUrl:
              'https://res.cloudinary.com/stoado/image/upload/v1718193585/Vouchers/spotify_zm3jvk.jpg',
          },
          {
            segment: '5% off order',
            probability: 12,
            voucherType: 'platform',
            voucherName: '5% off order',
            isSellingFees: false,
            imgUrl:
              'https://res.cloudinary.com/stoado/image/upload/v1718173786/Vouchers/stoado_ygaw0f.png',
          },
          {
            segment: '10% off order',
            probability: 6,
            voucherType: 'platform',
            voucherName: '10% off order',
            isSellingFees: false,
            imgUrl:
              'https://res.cloudinary.com/stoado/image/upload/v1718173786/Vouchers/stoado_ygaw0f.png',
          },
          {
            segment: '20% off order',
            probability: 5,
            voucherType: 'platform',
            voucherName: '20% off order',
            isSellingFees: false,
            imgUrl:
              'https://res.cloudinary.com/stoado/image/upload/v1718173786/Vouchers/stoado_ygaw0f.png',
          },
          { segment: '8 points', probability: 10.5, voucherType: 'points', voucherName: '8 points' },
          {
            segment: '13 points',
            probability: 8,
            voucherType: 'points',
            voucherName: '13 points',
          },
          {
            segment: '24 points',
            probability: 5,
            voucherType: 'points',
            voucherName: '24 points',
          },
          {
            segment: '37 points',
            probability: 3,
            voucherType: 'points',
            voucherName: '37 points',
          },
          {
            segment: '5 Voucher',
            probability: 7,
            voucherType: 'platform',
            voucherName: '5 Voucher',
            imgUrl:
              'https://res.cloudinary.com/stoado/image/upload/v1718173786/Vouchers/stoado_ygaw0f.png',
            isSellingFees: false,
          },
          {
            segment: '10 Voucher',
            probability: 4,
            voucherType: 'platform',
            voucherName: '10 Voucher',
            imgUrl:
              'https://res.cloudinary.com/stoado/image/upload/v1718173786/Vouchers/stoado_ygaw0f.png',
            isSellingFees: false,
          },
          {
            segment: '50 Voucher',
            probability: 1,
            voucherType: 'platform',
            voucherName: '50 Voucher',
            imgUrl:
              'https://res.cloudinary.com/stoado/image/upload/v1718173786/Vouchers/stoado_ygaw0f.png',
            isSellingFees: false,
          },
          {
            segment: '100 Voucher',
            probability: 0.3,
            voucherType: 'platform',
            voucherName: '100 Voucher',
            imgUrl:
              'https://res.cloudinary.com/stoado/image/upload/v1718173786/Vouchers/stoado_ygaw0f.png',
            isSellingFees: false,
          },
          {
            segment: '20% off selling fees',
            probability: 2.4,
            voucherType: 'platform',
            voucherName: '20% off selling fees',
            imgUrl:
              'https://res.cloudinary.com/stoado/image/upload/v1718173786/Vouchers/stoado_ygaw0f.png',
            isSellingFees: true,
          },
          {
            segment: '60% off selling fees',
            probability: 1,
            voucherType: 'platform',
            voucherName: '60% off selling fees',
            imgUrl:
              'https://res.cloudinary.com/stoado/image/upload/v1718173786/Vouchers/stoado_ygaw0f.png',
            isSellingFees: true,
          },
        ];

  const segColors = [
    '#535D78',
    '#535D78',
    '#535D78',
    '#535D78',
    '#535D78',
    '#535D78',
    '#535D78',
    '#535D78',
    '#535D78',
    '#535D78',
    '#535D78',
    '#535D78',
    '#535D78',
    '#535D78',
    '#535D78',
    '#535D78',
    '#535D78',
    '#535D78',
    '#535D78',
    '#535D78',
  ];

  const onFinished = winner => {
    const pointsArr = segments.find(elm => elm.segment === winner && elm.voucherType === 'points');
    const platform = segments.find(elm => elm.segment === winner && elm.voucherType === 'platform');
    const offPlatform = segments.find(
      elm => elm.segment === winner && elm.voucherType === 'off-platform'
    );

    let voucherType = '';
    let pointsValue = 0;
    let voucherValue = 0;
    let voucherValueType = '';

    const extractNumbers = str => {
      const match = str.match(/\d+/);
      return match ? parseInt(match[0], 10) : null;
    };

    const extractVoucherDetails = winner => {
      if (winner.includes('%')) {
        return { value: extractNumbers(winner), type: 'percent' };
      } else {
        return { value: extractNumbers(winner), type: 'price' };
      }
    };

    if (pointsArr) {
      pointsValue = parseInt(winner.split(' ')[0], 10); // Extract the numerical value
      earnedPoints({ userName, pointsValue });
    } else if (platform) {
      const details = extractVoucherDetails(winner);
      voucherValue = details.value;
      voucherValueType = details.type;
      platformRewardEmailToAdmin({
        userName: userName,
        image: platform?.imgUrl,
      });
    } else if (offPlatform) {
      const details = extractVoucherDetails(winner);
      voucherValue = details.value;
      voucherValueType = details.type;
      offPlatformRewardEmailToUser({
        userName: userName,
        image: offPlatform?.imgUrl,
        text: 'Earn More Rewards',
      });
      offPlatformRewardEmailToAdmin({
        userId: userId,
        reward: offPlatform?.voucherName,
      });
    }


    setSpinResult(winner);
    updateRedeemedVouchersHistoryPoints({
      userId: userId,
      type: 'spin',
      voucherName: winner,
      voucherType: platform?.voucherType,
      voucherValue: voucherValue,
      voucherValueType: voucherValueType,
      isSellingFees: platform?.isSellingFees,
    });

    if (pointsArr?.voucherType === 'points') {
      getRewardsPoint({
        rewardsPoint: pointsValue,
        type: 'add',
        userId: userId,
      });
    }


    setRemainingRewards(prev => prev + pointsValue);


    setTimeout(() => {
      setIsSpinModalOpen(true); // Open the spin result modal after 1 second
      setShowButton(true);
    }, 1000);
  };

  const closeSpinModal = () => {
    setIsSpinModalOpen(false);
  };

  const openModal = index => {
    setSelectedVoucher(index);
  };

  const closeModal = () => {
    setSelectedVoucher(null);
  };

  const settings = {
    className: 'slider variable-width',

    centerMode: false,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    variableWidth: false,
    arrows: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1.3,
        },
      },
    ],
  };

  const settings2 = {
    className: 'slider variable-width large-slider',

    centerMode: false,
    infinite: false,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    variableWidth: false,
    arrows: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  const nextSlide = () => {
    slider1.current.slickNext();
    slider2.current.slickNext();
  };

  const prevSlide = () => {
    slider1.current.slickPrev();
    slider2.current.slickPrev();
  };

  const handleSpin = () => {
    if (remainingSpin > 0) {
      if (remainingSpin <= 0) {
        console.error('You do not have Spin.');
        alert('You do not have Spin');
        return;
      }
      setSpinNow(!spinNow);
      if (wheelRef.current) {
        setShowButton(false);
        wheelRef.current.wheelInit(); // Call the spin method in the WheelComponent
        wheelRef.current.spin();
      }


      getRewardsPoint({
        spin: remainingSpin - 1,
        userId: userId,
      }).then(res => {
        if (res) {
          setRemainingSpin(prev => prev - 1);
        }
      });
    } else {
    }
  };

  const handleButtonClick = () => {
    if (!userName || !userId || !selectedVoucher) {
      console.error('Missing required information.');
      return;
    }

    if (remainingRewards < selectedVoucher.voucherPoints) {
      console.error('You do not have sufficient points.');
      alert('You do not have sufficient points.');
      return;
    }

    if (selectedVoucher.voucherType === 'off-platform') {
      offPlatformRewardEmailToUser({
        userName: userName,
        image: selectedVoucher.voucherImage,
        text: 'Earn More Rewards',
      });

      offPlatformRewardEmailToAdmin({
        userId: userId,
        reward: selectedVoucher.voucherName,
      });
    }

    if (selectedVoucher.voucherType === 'platform') {
      platformRewardEmailToAdmin({
        userName: userName,
        image: selectedVoucher.voucherImage,
      });
    }

    getRewardsPoint({
      rewardsPoint: selectedVoucher.voucherPoints,
      type: 'subtract',
      userId: userId,
    });

    if (selectedVoucher?.voucherPoints != undefined) {
      setRemainingRewards(prev => prev - selectedVoucher?.voucherPoints);
    }

    updateRedeemedVouchersHistoryPoints({
      userId: userId,
      type: 'voucher',
      voucherName: selectedVoucher.voucherName,
      voucherType: selectedVoucher.voucherType,
      voucherValue: selectedVoucher.voucherValue,
      voucherValueType: selectedVoucher.voucherValueType,
    });

    closeModal();
  };

  const largeVouchers = vouchers.filter(voucher => voucher.voucherSize === "large");
  const smallVouchers = vouchers.filter(voucher => voucher.voucherSize === "small");

  return (
    <Page className={css.root} title={'wishlist'} scrollingDisabled={isScrollingDisabled(state)}>
      <LayoutSingleColumn
        topbar={<TopbarContainer currentPage="MyWishlistPage" />}
        footer={<FooterContainer />}
        className={css.layoutMain}
      >
        <div className={css.rewardsPage}>
          <h1 className={css.rewardsPageHeader}>Reward Centre</h1>
          <div className={css.balanceCards}>
            <div className={css.rewardsPageBalance}>
              <h5>My Balance</h5>
              <h4>
                <span>{remainingRewards}</span> Points
              </h4>
              <h6>Get Points</h6>
            </div>
            <div className={css.rewardsPageBalance}>
              <h5>Points On Hold</h5>
              <h4>
                <span>{pointsOnHold}</span> Points
              </h4>
              <h6>Learn More</h6>
            </div>
            <div className={css.rewardsPageBalance}>
              <h5>How It Works</h5>
              <h6>
                <span>Earn points for interacting on Stoado & redeem fantastic rewards</span>
              </h6>
              <a href="#">Learn More</a>
            </div>
          </div>

          <h2 className={css.sectionTItle}>Redeemable Vouchers</h2>
          <div className={css.rewardsPageVouchers}>
            <div className={css.voucherSliderWrapper}>


              {smallVouchers && smallVouchers.length && <Slider {...settings} ref={slider1}>
                {smallVouchers.map((voucher, index) => (
                  <div
                    className={css.voucherCard}
                    key={index}
                    style={{ width: 250 }}
                    onClick={() => openModal(voucher)}
                  >
                    <img src={voucher?.voucherImage} alt={voucher.title} className={css.smallImage} />
                    <div className={css.voucherTitle}>
                      <h4>
                        <b>{voucher?.voucherName}</b> | {voucher?.voucherPoints}
                      </h4>
                    </div>
                  </div>
                ))}
              </Slider>}

              {largeVouchers && largeVouchers.length && <Slider ref={slider2} {...settings2}>
                {vouchers.map((voucher, index) => (
                  <div className={css.voucherCard} key={index}>
                    <img src={voucher?.voucherImage} alt={voucher.title} className={css.largeImage} />
                    <div className={css.voucherTitle}>
                      <h4>
                        <b>{voucher?.voucherName}</b> | {voucher?.voucherPoints}
                      </h4>
                    </div>
                  </div>
                ))}
              </Slider>}

            </div>
            <div className={css.sliderButtons}>
              <span onClick={prevSlide} className={css.previous}></span>
              <span onClick={nextSlide} className={css.next}></span>
            </div>
          </div>

          <div id="wheelCircle" className={css.wheelContainer}>
            <h4>Spin the Wheel to Win Rewards!</h4>
            <div className={css.spinContainer}>
              <div id="wheelCircle" className={css.wheelCircle}>
                <WheelComponent
                  ref={wheelRef} // Add ref here
                  segmentsData={segments}
                  segments={segments.map(segment => segment.segment)}
                  segColors={segColors}
                  onFinished={onFinished}
                  primaryColor="#0E1319"
                  primaryColoraround="#707070"
                  contrastColor="white"
                  buttonText="spin"
                  isOnlyOnce={false}
                  size={250}
                  upDuration={5}
                  downDuration={3000}

                />
              </div>

              <div className={css.spinNowContainer}>
                <div className={css.priceList}>
                  <svg
                    width="21"
                    height="21"
                    viewBox="0 0 21 21"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9.84375 9.1875H10.5V15.0938H11.1562M19.0312 10.5C19.0312 12.7626 18.1324 14.9326 16.5325 16.5325C14.9326 18.1324 12.7626 19.0312 10.5 19.0312C8.23737 19.0312 6.06742 18.1324 4.4675 16.5325C2.86758 14.9326 1.96875 12.7626 1.96875 10.5C1.96875 8.23737 2.86758 6.06742 4.4675 4.4675C6.06742 2.86758 8.23737 1.96875 10.5 1.96875C12.7626 1.96875 14.9326 2.86758 16.5325 4.4675C18.1324 6.06742 19.0312 8.23737 19.0312 10.5Z"
                      fill="white"
                    />
                    <path
                      d="M9.84375 9.1875H10.5V15.0938H11.1562M19.0312 10.5C19.0312 12.7626 18.1324 14.9326 16.5325 16.5325C14.9326 18.1324 12.7626 19.0312 10.5 19.0312C8.23737 19.0312 6.06742 18.1324 4.4675 16.5325C2.86758 14.9326 1.96875 12.7626 1.96875 10.5C1.96875 8.23737 2.86758 6.06742 4.4675 4.4675C6.06742 2.86758 8.23737 1.96875 10.5 1.96875C12.7626 1.96875 14.9326 2.86758 16.5325 4.4675C18.1324 6.06742 19.0312 8.23737 19.0312 10.5Z"
                      stroke="#F0B90B"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Prize List</span>
                </div>
                <h4>It Costs XYX Points To Play</h4>
                <h2>Play Spin the Wheel</h2>
                {showButton && <Button onClick={handleSpin}>Spin Now</Button>}{' '}
                {/* Add onClick event to call spin function */}
              </div>
            </div>

            <div className={css.coming}>
              <div>
                <h4>Pong</h4>
                <p>Coming Soon</p>
              </div>
              <div className={css.lineItems}>
                <div className={css.Firstline}></div>
                <div className={css.Secondline}></div>
              </div>
            </div>

            {/* Spin Result Modal */}
            <Modal
              isOpen={isSpinModalOpen}
              onClose={() => closeSpinModal()}
              onManageDisableScrolling={() => { }}
              className={css.spinResultModal}
            >
              <div className={css.modal}>
                <div className={css.modalContent}>
                  <h2 className={css.modalTitle}>Your Winnings!</h2>
                  {spinResult == 'No rewards' ? (
                    <div>
                      <img src={noRewardPic} alt="" style={{ background: '#000' }} />
                      <h4 className={css.modalText}>{spinResult}</h4>
                      <p className={css.subText}>Unlucky, no prizes this time round</p>
                    </div>
                  ) : spinResult?.includes('Stoado') ? (
                    <div style={{ textAlign: 'center' }}>
                      <img src={Stoado} alt="Stoado" height={230} />
                      <h4 className={css.modalText}>{spinResult}</h4>
                      <p className={css.subText}>
                        This voucher will be applied at checkout on your next purchase.
                      </p>
                      <Button onClick={closeSpinModal} className={css.getPoints}>
                        Buy Voucher
                      </Button>
                    </div>
                  ) : spinResult?.includes('Spotify') ? (
                    <div style={{ textAlign: 'center' }}>
                      <img src={Spotify} alt="" />
                      <h4 className={css.modalText}>{spinResult}</h4>
                      <Button onClick={closeSpinModal} className={css.getPoints}>
                        Get More Points
                      </Button>
                    </div>
                  ) : spinResult?.includes('Uber') ? (
                    <div style={{ textAlign: 'center' }}>
                      <img src={Uber} alt="" style={{ background: '#000' }} height={271} />
                      <h4 className={css.modalText}>{spinResult}</h4>
                      <p className={css.subText}>
                        You will receive this voucher via email within 48 hours.
                      </p>
                      <Button onClick={closeSpinModal} className={css.getPoints}>
                        Buy Voucher
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <img src={noRewardPic} alt="" style={{ background: '#000' }} />
                      <h4 className={css.modalText}>{spinResult}</h4>
                      <Button onClick={closeSpinModal} className={css.getPoints}>
                        Get More Points
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Modal>

            {/* Voucher Modal */}
            <Modal
              isOpen={selectedVoucher}
              onClose={() => closeModal()}
              onManageDisableScrolling={() => { }}
              className={css.spinResultModal}
            >
              <div className={css.modal}>
                <h2 className={css.modalTitle}>Confirm Your Reward</h2>
                <div className={css.ConfirmmodalContent}>
                  <img src={selectedVoucher?.voucherImage} alt={selectedVoucher?.title} width={'100%'} />
                  <h4 className={css.priceTitle}>
                    {' '}
                    {/* <span className={css.modalText}>{selectedVoucher?.voucherName}</span> */}
                    <h4 className={css.priceTitle}>
                      {' '}
                      <span className={css.modalText}>{selectedVoucher?.voucherName}</span>
                      &nbsp;|&nbsp;
                      <span>Points: {selectedVoucher?.voucherPoints}</span>
                    </h4>
                    {/* <span>Points: {selectedVoucher?.voucherPoints}</span> */}
                  </h4>
                  <Button className={css.buttonBuy} onClick={handleButtonClick}>
                    Buy Voucher
                  </Button>
                  {/* Add additional content for the modal */}
                </div>
              </div>
            </Modal>
          </div>
        </div>
      </LayoutSingleColumn>
    </Page>
  );
}

export default RewardsPage;
