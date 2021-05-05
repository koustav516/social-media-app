$('#postTextarea, #replyTextarea').keyup(e => {
    const textbox = $(e.target);
    const value = textbox.val().trim()
    
    const isModal = textbox.parents(".modal").length === 1;

    const submitButton = isModal ? $('#submitReplyButton') : $('#submitPostButton');

    if(submitButton.length === 0) return alert('No submit button found');

    if(value === "") {
        submitButton.prop("disabled",true);
        return;
    }

    submitButton.prop("disabled",false);
})

$('#submitPostButton, #submitReplyButton').click((e)=> {
    const button = $(e.target);
    const isModal = button.parents(".modal").length === 1;
    const textbox = isModal ? $('#replyTextarea') : $('#postTextarea');

    const data = {
        content: textbox.val()
    }

    if (isModal) {
        const id = button.data().id;
        if(id === null) return alert("Id is null");
        data.replyTo = id;
    }

    $.post("/api/posts", data, postData => {
        if(postData.replyTo) {
            location.reload();
        }else{
            const html = createPostHtml(postData);
            $(".postsContainer").prepend(html);
            textbox.val("");
            button.prop("disabled",true);
        }
    })
});

$("#replyModal").on("show.bs.modal", (e) => {
    const button = $(e.relatedTarget);
    const postId = getPostIdFromElement(button);
    $('#submitReplyButton').data("id", postId);

    $.get(`/api/posts/${postId}`, results => {
        outputPosts(results,$("#originalPostContainer"))
    })
})

$("#replyModal").on("hidden.bs.modal", () => $("#originalPostContainer").html(""))

$(document).on("click",".likeButton",(e)=> {
    const button = $(e.target);
    const postId = getPostIdFromElement(button);

    if(postId === undefined) return;

    $.ajax({
        url: `/api/posts/${postId}/like`,
        type: "PUT",
        success: (postData) => {
            button.find("span").text(postData.likes.length || "");
            
            if(postData.likes.includes(userLoggedIn._id)) {
                button.addClass("active");
            } else {
                button.removeClass("active");
            }
        }
    })
});

$(document).on("click",".retweetButton",(e)=> {
    const button = $(e.target);
    const postId = getPostIdFromElement(button);

    if(postId === undefined) return;

    $.ajax({
        url: `/api/posts/${postId}/retweet`,
        type: "POST",
        success: (postData) => {
            button.find("span").text(postData.retweetUsers.length || "");
            
            if(postData.retweetUsers.includes(userLoggedIn._id)) {
                button.addClass("active");
            } else {
                button.removeClass("active");
            }
        }
    })
});

function getPostIdFromElement(element) {
    const isRoot = element.hasClass("post");
    const rootElement = isRoot ? element : element.closest(".post");
    const postId = rootElement.data().id;

    if(postId === undefined) return alert('post id undefiend');

    return postId;
}

function createPostHtml(postData) {
    if(postData === null) return alert("post object is null");
    
    const isRetweet = postData.retweetData !== undefined;
    let reTweetedBy = isRetweet ? postData.postedBy.username : null;
    postData = isRetweet ? postData.retweetData : postData;

    const postedBy = postData.postedBy;

    if(postedBy._id === undefined) {
        return console.log('User object not populated')
    }

    const displayName = postedBy.firstname + " " + postedBy.lastname;
    const timeStamp = timeDifference(new Date(), new Date(postData.createdAt));
    const likeButtonActiveClass = postData.likes.includes(userLoggedIn._id) ? "active" : "";
    const retweetButtonActiveClass = postData.retweetUsers.includes(userLoggedIn._id) ? "active" : "";

    let retweetText = '';
    if(isRetweet) {
        retweetText = `
            <span>
                <i class='fas fa-retweet'></i>
                Retweeted by <a href='/profile/${reTweetedBy}'>@${reTweetedBy}</a>
            </span>`
    }

    let replyFlag = "";
    if(postData.replyTo) {
        
        if(!postData.replyTo._id) {
            return alert("Reply is not populated")
        }else if(!postData.replyTo.postedBy._id) {
            return alert("Posted by is not populated")
        }
        
        const replyToUsername = postData.replyTo.postedBy.username;
        replyFlag = `<div class='replyFlag'>
                        Replying To <a href='/profile/${replyToUsername}'>@${replyToUsername}</a>
                    </div>`
    }

    return `<div class='post' data-id='${postData._id}'>
                <div class='postActionContainer'>
                    ${retweetText}
                </div>
                <div class='mainContentContainer'>
                    <div class='userImageContainer'>
                        <img src='${postedBy.profilePic}'>
                    </div>
                    <div class='postContentContainer'>
                        <div class='header'>
                            <a href='/profile/${postedBy.username}' class='displayName'>${displayName}</a>
                            <span class='username'>@${postedBy.username}</span>
                            <span class='date'>${timeStamp}</span>
                        </div>
                        ${replyFlag}
                        <div class='postBody'>
                            <span>${postData.content}</span>
                        </div>
                        <div class='postFooter'>
                            <div class='postButtonContainer'>
                               <button data-toggle="modal" data-target="#replyModal">
                                    <i class='far fa-comment'></i>
                               </button> 
                            </div>
                            <div class='postButtonContainer green'>
                               <button class='retweetButton ${retweetButtonActiveClass}'>
                                    <i class='fas fa-retweet'></i>
                                    <span>${postData.retweetUsers.length || ""}</span>
                               </button> 
                            </div>
                            <div class='postButtonContainer red'>
                               <button class='likeButton ${likeButtonActiveClass}'>
                                    <i class='far fa-heart'></i>
                                    <span>${postData.likes.length || ""}</span>
                               </button> 
                            </div>
                        </div>
                    </div>
                </div>
            </div>`
}

function timeDifference(current, previous) {

    const msPerMinute = 60 * 1000;
    const msPerHour = msPerMinute * 60;
    const msPerDay = msPerHour * 24;
    const msPerMonth = msPerDay * 30;
    const msPerYear = msPerDay * 365;

    const elapsed = current - previous;

    if (elapsed < msPerMinute) {
        if(elapsed/1000 < 30) return "Just Now";

        return Math.round(elapsed/1000) + ' seconds ago';   
    }

    else if (elapsed < msPerHour) {
         return Math.round(elapsed/msPerMinute) + ' minutes ago';   
    }

    else if (elapsed < msPerDay ) {
         return Math.round(elapsed/msPerHour ) + ' hours ago';   
    }

    else if (elapsed < msPerMonth) {
        return Math.round(elapsed/msPerDay) + ' days ago';   
    }

    else if (elapsed < msPerYear) {
        return Math.round(elapsed/msPerMonth) + ' months ago';   
    }

    else {
        return Math.round(elapsed/msPerYear ) + ' years ago';   
    }
}

function outputPosts(results,container) {
    container.html("");

    if(!Array.isArray(results)) {
        results = [results];
    }

    results.forEach(result => {
        const html = createPostHtml(result);
        container.append(html);
    });

    if(results.length === 0) {
        container.append("<span class='noResults'>No results to show</span>");
    }
}