import {isFormValid} from "./validators";
import {isUserLoggedIn} from "./app";

const commentForm = document.getElementById('comment-form');
const commentMessage = commentForm.querySelector('#comment-form__message');
export const commentTextarea = commentForm.querySelector('#comment-form__textarea');
export const submitCommentButton = commentForm.querySelector('#comment-form__submit');
export const commentList = document.getElementById('comment-list');

export class Comment {
    static create(newComment) {
        return Comment.refreshIdToken(getRefreshToken())
            .then((idToken) => Comment.sendCreateCommentRequest(idToken, newComment))
            .then(Comment.getCommentsFromServer)
            .then(Comment.renderList);
    }

    static refreshIdToken(refreshToken) {
        return new Promise((resolve, reject) => {
            const apiKey = 'AIzaSyDG87gKP0-Ok2jooqU5PiDR6EBf_7LCMD8';
            return fetch(`https://securetoken.googleapis.com/v1/token?key=${apiKey}`, {
                method: 'POST',
                body: JSON.stringify({
                    grant_type: "refresh_token",
                    refreshToken
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(response => {
                    let userData = getUserDataFromLocalstorage();
                    userData.refreshToken = response.refresh_token;
                    localStorage.setItem('userData', JSON.stringify(userData));
                    resolve(response.id_token);
                })
                .then(resolve).catch(reject);
        })
    }

    static sendCreateCommentRequest(idToken, newComment) {
        return new Promise((resolve, reject) => {
            return fetch(`https://holy-war.firebaseio.com/comments.json?auth=${idToken}`, {
                method: 'POST',
                body: JSON.stringify(newComment),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(response => {
                    return !response.error ? resolve() : reject();
                });
        })
    }

    static getCommentsFromServer() {
        return new Promise((resolve, reject) => {
            return fetch('https://holy-war.firebaseio.com/comments.json')
                .then(response => response.json())
                .then(response => {
                    response && response.error && reject();
                    resolve(response ? Object.keys(response).map(key => ({
                        ...response[key],
                        id: key
                    })).reverse() : []);
                });
        })
    }

    static renderList(commentsList) {
        commentList.innerHTML = commentsList.length
            ? commentsList.map(toCard).join('')
            : `<h5>No comments yet</h5>`;
    }

    static delete(commentData) {
        return Comment.refreshIdToken(getRefreshToken())
            .then((idToken) => Comment.sendDeleteCommentRequest(idToken, commentData))
            .then(Comment.getCommentsFromServer)
            .then(Comment.renderList);
    }

    static sendDeleteCommentRequest(idToken, commentData) {
        return new Promise((resolve, reject) => {
            return fetch(`https://holy-war.firebaseio.com/comments/${commentData.id}.json?auth=${idToken}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(resolve).catch(reject);
        })
    }
}

export function submitCommentHandler(event) {
    event.preventDefault();

    if (isFormValid(commentForm) && isUserLoggedIn()) {
        let {name, localId} = getAuthorDataFormLocalStorage();

        let newComment = {
            text: commentTextarea.value.trim(),
            date: new Date().toJSON(),
            author: name,
            authorLocalId: localId
        };

        submitCommentButton.disabled = true;

        Comment.create(newComment).then(() => {
            resetCommentForm();
            submitCommentButton.disabled = false;
        }).catch(() => {
            commentMessage.innerHTML= 'Failed to create comment. Please try again!';
        });
    }
}

function getUserDataFromLocalstorage() {
    return JSON.parse(localStorage.getItem('userData'));
}

function getAuthorDataFormLocalStorage() {
    return JSON.parse(localStorage.getItem('userData'));
}

function getRefreshToken() {
    return JSON.parse(localStorage.getItem('userData'))['refreshToken'];
}

function resetCommentForm() {
    commentTextarea.value = '';
}

function toCard(comment) {
    let closeButton = ``;
    let localId = getUserDataFromLocalstorage() ? getUserDataFromLocalstorage().localId : null;

    if (comment.authorLocalId === localId) {
        closeButton = `<i class="material-icons right close-button" data-id="${comment.id}">close</i>`
    }

    return `
    <div class="col s12 m6">
          <div class="card teal lighten-3t">
              <div class="card-content white-text">
                  <span class="card-title">${comment.author}` +
                        closeButton +
                  `</span>
                  <div>
                    ${new Date(comment.date).toLocaleDateString()}
                    ${new Date(comment.date).toLocaleTimeString()}
                  </div>
                  <p>${comment.text}</p>
              </div>
          </div>
      </div>
    `
}

export function deleteCommentHandler(event) {
    event.preventDefault();
    let commentData = event.target.dataset;

    if (commentData && commentData.id) {
        Comment.delete(commentData).catch(() => {
            commentMessage.innerHTML= 'Failed to delete comment. Please try again!';
        });
    }
}
