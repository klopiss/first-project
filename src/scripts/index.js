/*
  Файл index.js является точкой входа в наше приложение
  и только он должен содержать логику инициализации нашего приложения
  используя при этом импорты из других файлов

  Из index.js не допускается что то экспортировать
*/
import { enableValidation, clearValidation } from './components/validate.js';
import { getCardList, getUserInfo, setUserInfo, updateUserAvatar, addNewCard, 
  deleteCardOnServer, changeLikeCardStatus } from "./components/api.js";
import { createCardElement, deleteCard, likeCard } from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";

// DOM узлы
const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");

const cardInfoModalWindow = document.querySelector(".popup_type_info");
const cardInfoModalTitle = cardInfoModalWindow.querySelector(".popup__title");
const cardInfoModalInfoList = cardInfoModalWindow.querySelector(".popup__info");
const cardInfoModalUserList = cardInfoModalWindow.querySelector(".popup__list");

// Глобальная переменная для ID текущего пользователя
let currentUserId = null;

const formatDate = (date) =>
  date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const createInfoString = (term, description) => {
  const template = document.getElementById("popup-info-definition-template");
  const infoItem = template.content.cloneNode(true);
  infoItem.querySelector(".popup__info-term").textContent = term;
  infoItem.querySelector(".popup__info-description").textContent = description;
  return infoItem;
};

const createUserPreview = (user) => {
  const template = document.getElementById("popup-info-user-preview-template");
  const userItem = template.content.cloneNode(true);
  userItem.querySelector(".popup__list-item").textContent = user.name;
  return userItem;
};

const handleInfoClick = (cardId) => {
  getCardList()
    .then((cards) => {
      const cardData = cards.find(card => card._id === cardId);
      
      cardInfoModalInfoList.innerHTML = "";
      cardInfoModalInfoList.append(
        createInfoString("Описание:", cardData.name),
        createInfoString("Дата создания:", formatDate(new Date(cardData.createdAt))),
        createInfoString("Владелец:", cardData.owner.name),
        createInfoString("Количество лайков:", cardData.likes.length.toString())
      );
      
      cardInfoModalUserList.innerHTML = "";
      cardData.likes.forEach(like => {
        cardInfoModalUserList.append(createUserPreview(like));
      });
      
      let likesHeader = cardInfoModalWindow.querySelector(".popup__text");
      if (!likesHeader) {
        likesHeader = document.createElement("h4");
        likesHeader.className = "popup__text";
        cardInfoModalWindow.querySelector(".popup__content").appendChild(likesHeader);
      }
      likesHeader.textContent = "Лайкнули:";
      
      openModalWindow(cardInfoModalWindow);
    })
    .catch((err) => {
      console.log(err);
    });
};

const handleDeleteCard = (cardElement, cardId) => {
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  const originalText = deleteButton.textContent;
  deleteButton.textContent = 'Удаление...';
  
  deleteCardOnServer(cardId)
    .then(() => {
      deleteCard(cardElement);
    })
    .catch((err) => {
      console.log('Ошибка при удалении карточки:', err);
    })
    .finally(() => {
      deleteButton.textContent = originalText;
    });
};

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = profileForm.querySelector('.popup__button');
  const originalText = submitButton.textContent;
  submitButton.textContent = 'Сохранение...';
  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => {
      console.log('Ошибка при обновлении профиля:', err);
    })
    .finally(() => {
      submitButton.textContent = originalText;
    });
};

const handleAvatarFromSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = avatarForm.querySelector('.popup__button');
  const originalText = submitButton.textContent;
  submitButton.textContent = 'Сохранение...';
  
  updateUserAvatar(avatarInput.value)
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      closeModalWindow(avatarFormModalWindow);
      avatarForm.reset();
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      submitButton.textContent = originalText;
    });
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = cardForm.querySelector('.popup__button');
  const originalText = submitButton.textContent;
  submitButton.textContent = 'Создание...';
  
  addNewCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((newCard) => {
      placesWrap.prepend(
        createCardElement(newCard, {
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: likeCard,
          onDeleteCard: handleDeleteCard,
          changeLikeCardStatus: changeLikeCardStatus,
          onInfoClick: handleInfoClick,
        }, currentUserId)
      );
      cardForm.reset();
      closeModalWindow(cardFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      submitButton.textContent = originalText;
    });
};

// EventListeners
profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFromSubmit);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  clearValidation(profileForm, validationConfig);  
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationConfig);  
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  clearValidation(cardForm, validationConfig); 
  openModalWindow(cardFormModalWindow);
});

const validationConfig = {
  formSelector: '.popup__form',
  inputSelector: '.popup__input',
  submitButtonSelector: '.popup__button',
  inactiveButtonClass: 'popup__button_disabled',
  inputErrorClass: 'popup__input_type_error',
  errorClass: 'popup__error_visible'
};

enableValidation(validationConfig);

Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
    
    currentUserId = userData._id;
    
    cards.forEach((card) => {
      placesWrap.append(
        createCardElement(card, {
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: likeCard,
          onDeleteCard: handleDeleteCard,
          changeLikeCardStatus: changeLikeCardStatus,
          onInfoClick: handleInfoClick,
        }, currentUserId)
      );
    });
  })
  .catch((err) => {
    console.log(err);
  });

//настраиваем обработчики закрытия попапов
const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});
