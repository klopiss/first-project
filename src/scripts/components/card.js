export const likeCard = (likeButton, cardId, changeLikeCardStatus) => {
  const isLiked = likeButton.classList.contains("card__like-button_is-active");
  const likeCountElement = likeButton.closest(".card__likes").querySelector(".card__like-count");
  
  changeLikeCardStatus(cardId, isLiked)
    .then((updatedCard) => {
      likeButton.classList.toggle("card__like-button_is-active");
      likeCountElement.textContent = updatedCard.likes.length;
    })
    .catch((err) => {
      console.log('Ошибка при изменении лайка:', err);
    });
};

export const deleteCard = (cardElement) => {
  cardElement.remove();
};

const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

export const createCardElement = (
  data,
  { onPreviewPicture, onLikeIcon, onDeleteCard, changeLikeCardStatus, onInfoClick }, 
  currentUserId  
) => {
  const cardElement = getTemplate();
  const likeButton = cardElement.querySelector(".card__like-button");
  const likeCountElement = cardElement.querySelector(".card__like-count");
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  const infoButton = cardElement.querySelector(".card__control-button_type_info");
  const cardImage = cardElement.querySelector(".card__image");

  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardElement.querySelector(".card__title").textContent = data.name;
  
  likeCountElement.textContent = data.likes.length;

  if (data.likes.some(like => like._id === currentUserId)) {
    likeButton.classList.add("card__like-button_is-active");
  }

  if (data.owner && data.owner._id !== currentUserId) {
    deleteButton.remove(); 
  } else if (onDeleteCard) {
    deleteButton.addEventListener("click", () => onDeleteCard(cardElement, data._id));
  }

  if (onLikeIcon) {
    likeButton.addEventListener("click", () => onLikeIcon(likeButton, data._id, changeLikeCardStatus));
  }

  if (onPreviewPicture) {
    cardImage.addEventListener("click", () => onPreviewPicture({name: data.name, link: data.link}));
  }

  if (onInfoClick) {
    infoButton.addEventListener("click", () => onInfoClick(data._id));
  }

  return cardElement;
};