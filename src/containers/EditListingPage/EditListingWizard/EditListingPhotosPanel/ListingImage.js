import React from 'react';
import { func, object, string } from 'prop-types';
import classNames from 'classnames';

// Import shared components
import {
  AspectRatioWrapper,
  ImageFromFile,
  ResponsiveImage,
  IconSpinner,
} from '../../../../components';

// Import modules from this directory
import css from './ListingImage.module.css';

// Cross shaped button on the top-right corner of the image thumbnail
const RemoveImageButton = props => {
  const { className, rootClassName, onClick } = props;
  const classes = classNames(rootClassName || css.removeImage, className);
  return (
    <button className={classes} onClick={onClick}>
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g filter="url(#filter0_d_185_4536)">
          <path
            d="M15.7812 13.2565C15.9837 13.4591 16.0975 13.7338 16.0975 14.0202C16.0975 14.3066 15.9837 14.5813 15.7812 14.7839C15.5786 14.9864 15.3039 15.1002 15.0175 15.1002C14.7311 15.1002 14.4564 14.9864 14.2538 14.7839L8.54964 9.07789L2.84367 14.7821C2.64113 14.9846 2.36643 15.0984 2.08 15.0984C1.79356 15.0984 1.51886 14.9846 1.31632 14.7821C1.11379 14.5795 1 14.3048 1 14.0184C1 13.732 1.11379 13.4573 1.31632 13.2547L7.0223 7.55054L1.31812 1.84457C1.11558 1.64203 1.0018 1.36733 1.0018 1.08089C1.0018 0.794461 1.11558 0.51976 1.31812 0.317222C1.52066 0.114683 1.79536 0.00089829 2.08179 0.000898287C2.36822 0.000898284 2.64293 0.114683 2.84546 0.317222L8.54964 6.0232L14.2556 0.316323C14.4582 0.113785 14.7329 -4.77197e-09 15.0193 0C15.3057 4.77197e-09 15.5804 0.113785 15.783 0.316323C15.9855 0.518861 16.0993 0.793562 16.0993 1.07999C16.0993 1.36643 15.9855 1.64113 15.783 1.84367L10.077 7.55054L15.7812 13.2565Z"
            fill="white"
          />
        </g>
        <defs>
          <filter
            id="filter0_d_185_4536"
            x="0"
            y="0"
            width="17.0992"
            height="17.1001"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="1" />
            <feGaussianBlur stdDeviation="0.5" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_185_4536" />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_185_4536"
              result="shape"
            />
          </filter>
        </defs>
      </svg>
    </button>
  );
};

// Cropped "thumbnail" of given listing image.
// The image might be one already uploaded and attached to listing entity
// or representing local image file (before it's uploaded & attached to listing).
const ListingImage = props => {
  const {
    className,
    image,
    savedImageAltText,
    onRemoveImage,
    aspectWidth = 1,
    aspectHeight = 1,
    variantPrefix = 'listing-card',
  } = props;
  const handleRemoveClick = e => {
    e.stopPropagation();
    onRemoveImage(image.id);
  };

  if (image.file && !image.attributes) {
    // Add remove button only when the image has been uploaded and can be removed
    const removeButton = image.imageId ? <RemoveImageButton onClick={handleRemoveClick} /> : null;

    // While image is uploading we show overlay on top of thumbnail
    const uploadingOverlay = !image.imageId ? (
      <div className={css.thumbnailLoading}>
        <IconSpinner />
      </div>
    ) : null;

    return (
      <ImageFromFile
        id={image.id}
        className={className}
        file={image.file}
        aspectWidth={aspectWidth}
        aspectHeight={aspectHeight}
      >
        {removeButton}
        {uploadingOverlay}
      </ImageFromFile>
    );
  } else {
    const classes = classNames(css.root, className);

    const variants = image
      ? Object.keys(image?.attributes?.variants).filter(k => k.startsWith(variantPrefix))
      : [];
    const imgForResponsiveImage = image.imageId ? { ...image, id: image.imageId } : image;

    // This is shown when image is uploaded,
    // but the new responsive image is not yet downloaded by the browser.
    // This is absolutely positioned behind the actual image.
    const fallbackWhileDownloading = image.file ? (
      <ImageFromFile
        id={image.id}
        className={css.fallbackWhileDownloading}
        file={image.file}
        aspectWidth={aspectWidth}
        aspectHeight={aspectHeight}
      >
        <div className={css.thumbnailLoading}>
          <IconSpinner />
        </div>
      </ImageFromFile>
    ) : null;

    return (
      <div className={classes}>
        <div className={css.wrapper}>
          {fallbackWhileDownloading}
          <AspectRatioWrapper width={aspectWidth} height={aspectHeight}>
            <ResponsiveImage
              rootClassName={css.rootForImage}
              image={imgForResponsiveImage}
              alt={savedImageAltText}
              variants={variants}
            />
          </AspectRatioWrapper>
          <RemoveImageButton onClick={handleRemoveClick} />
        </div>
      </div>
    );
  }
};

ListingImage.defaultProps = { className: null };

ListingImage.propTypes = {
  className: string,
  image: object.isRequired,
  savedImageAltText: string.isRequired,
  onRemoveImage: func.isRequired,
};

export default ListingImage;
