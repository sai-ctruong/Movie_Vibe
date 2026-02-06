import styled from 'styled-components';

const PoweredByButton = () => {
  return (
    <StyledWrapper>
      <button className="powered-button">
        <div className="icon-wrapper">
          <svg className="openai-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.8956zm16.0993 3.8558L12.5907 8.3829 14.6108 7.2144a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.3927-.6813zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" fill="currentColor" />
          </svg>
        </div>
        <div className="text-wrapper">
          <span className="label">Powered By</span>
          <span className="brand">Tee</span>
        </div>
      </button>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;

  .powered-button {
    position: relative;
    width: 160px;
    height: 160px;
    background: linear-gradient(135deg, #063525 0%, #0d5638 100%);
    border: 3px solid #42c498;
    border-radius: 16px;
    color: #e5dede;
    font-weight: 600;
    cursor: pointer;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    transition: all 0.35s cubic-bezier(0.23, 1, 0.320, 1);
    transform: translateZ(0);
    will-change: transform, box-shadow;

    &:hover {
      background: linear-gradient(135deg, #0d5638 0%, #1a6d4a 100%);
      border-color: #2adb9e;
      transform: translateY(-8px) scale(1.02);
      box-shadow: 
        0 12px 24px rgba(66, 196, 152, 0.15),
        0 20px 40px rgba(0, 0, 0, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
    }

    &:active {
      transform: translateY(-4px) scale(0.98);
    }
  }

  /* Shine effect - smooth and subtle */
  .powered-button::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.15) 25%,
      rgba(255, 255, 255, 0.25) 50%,
      rgba(255, 255, 255, 0.15) 75%,
      transparent 100%
    );
    transition: none;
    pointer-events: none;
  }

  .powered-button:hover::before {
    animation: glossSlide 0.7s ease-in-out forwards;
  }

  @keyframes glossSlide {
    0% {
      left: -100%;
    }
    100% {
      left: 100%;
    }
  }

  /* Icon animation */
  .icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.35s cubic-bezier(0.23, 1, 0.320, 1);
    z-index: 2;
  }

  .openai-icon {
    width: 56px;
    height: 56px;
    color: #42c498;
    transition: all 0.35s cubic-bezier(0.23, 1, 0.320, 1);
    filter: drop-shadow(0 0 0 transparent);
  }

  .powered-button:hover .icon-wrapper {
    transform: scale(1.1);
  }

  .powered-button:hover .openai-icon {
    color: #2adb9e;
    filter: drop-shadow(0 4px 8px rgba(42, 219, 158, 0.4));
    animation: iconFloat 2s ease-in-out infinite;
  }

  @keyframes iconFloat {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-8px);
    }
  }

  /* Text animation */
  .text-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    z-index: 2;
    overflow: hidden;
    height: 0;
    opacity: 0;
    transition: all 0.35s cubic-bezier(0.23, 1, 0.320, 1);
    transform: translateY(10px);
  }

  .powered-button:hover .text-wrapper {
    height: auto;
    opacity: 1;
    transform: translateY(0);
  }

  .label {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.5px;
    color: #a0b0b0;
    text-transform: uppercase;
  }

  .brand {
    font-size: 14px;
    font-weight: 700;
    color: #2adb9e;
    letter-spacing: 0.8px;
  }

  .powered-button:active .text-wrapper {
    transform: translateY(-2px);
  }
`;

export default PoweredByButton;
