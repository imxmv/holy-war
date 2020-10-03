import {
    Comment,
    commentList,
    commentTextarea,
    deleteCommentHandler,
    submitCommentButton,
    submitCommentHandler
} from './comment'
import {submitRegistrationButton, submitRegistrationHandler} from "./registration";
import {submitAuthorizationButton, submitAuthorizationHandler} from "./authorization";
import './styles.css'

const headerTitle = document.querySelector('#header__title');

window.addEventListener('load', function() {
    const modal = document.querySelectorAll('.modal');
    const sidenav = document.querySelectorAll('.sidenav');

    M.Modal.init(modal);
    M.Sidenav.init(sidenav, {});

    renderHeaderTitle();
    checkCommentFormState();
    Comment.getCommentsFromServer().then(Comment.renderList);
});

submitRegistrationButton.addEventListener('click', submitRegistrationHandler);
submitAuthorizationButton.addEventListener('click', submitAuthorizationHandler);
submitCommentButton.addEventListener('click', submitCommentHandler);
commentList.addEventListener('click', deleteCommentHandler);

export function renderHeaderTitle() {
    headerTitle.innerHTML = isUserLoggedIn() ?
        'Leave your comment now!' :
        'Leave your comment! (before this you need to log in)';
}

export function checkCommentFormState() {
    if (isUserLoggedIn()) {
        commentTextarea.disabled = false;
        submitCommentButton.disabled = false;
    }
}

export function isUserLoggedIn() {
    return !!JSON.parse(localStorage.getItem('userData'));
}
