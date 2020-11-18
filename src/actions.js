import {createPopupNotification, getMemberEmail, getMemberName, removePortalLinkFromUrl} from './utils/helpers';

function switchPage({data}) {
    return {
        page: data.page,
        popupNotification: null,
        lastPage: data.lastPage || null
    };
}

function togglePopup({state}) {
    return {
        showPopup: !state.showPopup
    };
}

function openPopup({data}) {
    return {
        showPopup: true,
        page: data.page
    };
}

function back({state}) {
    if (state.lastPage) {
        return {
            page: state.lastPage
        };
    } else {
        return closePopup({state});
    }
}

function closePopup({state}) {
    removePortalLinkFromUrl();
    return {
        showPopup: false,
        lastPage: null,
        pageQuery: '',
        popupNotification: null,
        page: state.page === 'magiclink' ? '' : state.page
    };
}

function openNotification({data}) {
    return {
        showNotification: true,
        ...data
    };
}

function closeNotification({state}) {
    return {
        showNotification: false
    };
}

async function signout({api, state}) {
    try {
        await api.member.signout();
        return {
            action: 'signout:success'
        };
    } catch (e) {
        return {
            action: 'signout:failed',
            popupNotification: createPopupNotification({
                type: 'signout:failed', autoHide: false, closeable: true, state, status: 'error',
                message: 'Failed to log out, please try again'
            })
        };
    }
}

async function signin({data, api, state}) {
    try {
        await api.member.sendMagicLink(data);
        return {
            page: 'magiclink'
        };
    } catch (e) {
        return {
            action: 'signin:failed',
            popupNotification: createPopupNotification({
                type: 'signin:failed', autoHide: false, closeable: true, state, status: 'error',
                message: 'Failed to log in, please try again'
            })
        };
    }
}

async function signup({data, state, api}) {
    try {
        const {plan, email, name} = data;
        if (plan.toLowerCase() === 'free') {
            await api.member.sendMagicLink(data);
        } else {
            await api.member.checkoutPlan({plan, email, name});
        }
        return {
            page: 'magiclink'
        };
    } catch (e) {
        return {
            action: 'signup:failed',
            popupNotification: createPopupNotification({
                type: 'signup:failed', autoHide: false, closeable: true, state, status: 'error',
                message: 'Failed to sign up, please try again'
            })
        };
    }
}

async function checkoutPlan({data, state, api}) {
    try {
        const {plan} = data;
        await api.member.checkoutPlan({
            plan,
            metadata: {
                checkoutType: 'upgrade'
            }
        });
    } catch (e) {
        return {
            action: 'checkoutPlan:failed',
            popupNotification: createPopupNotification({
                type: 'checkoutPlan:failed', autoHide: false, closeable: true, state, status: 'error',
                message: 'Failed to process checkout, please try again'
            })
        };
    }
}

async function updateSubscription({data, state, api}) {
    try {
        const {plan, subscriptionId, cancelAtPeriodEnd} = data;
        await api.member.updateSubscription({
            planName: plan, subscriptionId, cancelAtPeriodEnd
        });
        const member = await api.member.sessionData();
        const action = 'updateSubscription:success';
        return {
            action,
            popupNotification: createPopupNotification({
                type: action, autoHide: true, closeable: true, state, status: 'success',
                message: 'Subscription plan updated successfully'
            }),
            page: 'accountHome',
            member: member
        };
    } catch (e) {
        return {
            action: 'updateSubscription:failed',
            popupNotification: createPopupNotification({
                type: 'updateSubscription:failed', autoHide: false, closeable: true, state, status: 'error',
                message: 'Failed to update subscription, please try again'
            })
        };
    }
}

async function cancelSubscription({data, state, api}) {
    try {
        const {subscriptionId, cancelAtPeriodEnd} = data;
        await api.member.updateSubscription({
            subscriptionId, cancelAtPeriodEnd
        });
        const member = await api.member.sessionData();
        const action = 'cancelSubscription:success';
        return {
            action,
            page: 'accountHome',
            member: member
        };
    } catch (e) {
        return {
            action: 'cancelSubscription:failed',
            popupNotification: createPopupNotification({
                type: 'cancelSubscription:failed', autoHide: false, closeable: true, state, status: 'error',
                message: 'Failed to cancel subscription, please try again'
            })
        };
    }
}

async function editBilling({data, state, api}) {
    try {
        await api.member.editBilling();
    } catch (e) {
        return {
            action: 'editBilling:failed',
            popupNotification: createPopupNotification({
                type: 'editBilling:failed', autoHide: false, closeable: true, state, status: 'error',
                message: 'Failed to update billing information, please try again'
            })
        };
    }
}

async function clearPopupNotification() {
    return {
        popupNotification: null
    };
}

async function updateNewsletter({data, state, api}) {
    try {
        const {subscribed} = data;
        const member = await api.member.update({subscribed});
        if (!member) {
            throw new Error('Failed to update newsletter');
        }
        const action = 'updateNewsletter:success';
        return {
            action,
            member: member,
            popupNotification: createPopupNotification({
                type: action, autoHide: true, closeable: true, state, status: 'success',
                message: 'Email newsletter settings updated'
            })
        };
    } catch (e) {
        return {
            action: 'updateNewsletter:failed',
            popupNotification: createPopupNotification({
                type: 'updateNewsletter:failed', autoHide: true, closeable: true, state, status: 'error',
                message: 'Failed to update newsletter settings'
            })
        };
    }
}

async function updateMemberEmail({data, state, api}) {
    const {email} = data;
    const originalEmail = getMemberEmail({member: state.member});
    if (email !== originalEmail) {
        try {
            await api.member.sendMagicLink({email, oldEmail: originalEmail, emailType: 'updateEmail'});
            return {
                success: true
            };
        } catch (err) {
            return {
                success: false,
                error: err
            };
        }
    }
    return null;
}

async function updateMemberData({data, state, api}) {
    const {name} = data;
    const originalName = getMemberName({member: state.member});
    if (originalName !== name) {
        try {
            const member = await api.member.update({name});
            if (!member) {
                throw new Error('Failed to update member');
            }
            return {
                member,
                success: true
            };
        } catch (err) {
            return {
                success: false,
                error: err
            };
        }
    }
    return null;
}

async function updateProfile({data, state, api}) {
    const [dataUpdate, emailUpdate] = await Promise.all([updateMemberData({data, state, api}), updateMemberEmail({data, state, api})]);
    if (dataUpdate && emailUpdate) {
        if (emailUpdate.success) {
            return {
                action: 'updateProfile:success',
                ...(dataUpdate.success ? {member: dataUpdate.member} : {}),
                page: 'accountHome',
                popupNotification: createPopupNotification({
                    type: 'updateProfile:success', autoHide: true, closeable: true, status: 'success', state,
                    message: 'Check your inbox to verify email update'
                })
            };
        }
        const message = !dataUpdate.success ? 'Failed to update account data' : 'Failed to send verification email';

        return {
            action: 'updateProfile:failed',
            ...(dataUpdate.success ? {member: dataUpdate.member} : {}),
            popupNotification: createPopupNotification({
                type: 'updateProfile:failed', autoHide: true, closeable: true, status: 'error', message, state
            })
        };
    } else if (dataUpdate) {
        const action = dataUpdate.success ? 'updateProfile:success' : 'updateProfile:failed';
        const status = dataUpdate.success ? 'success' : 'error';
        const message = !dataUpdate.success ? 'Failed to update account details' : 'Account details updated successfully';
        return {
            action,
            ...(dataUpdate.success ? {member: dataUpdate.member} : {}),
            ...(dataUpdate.success ? {page: 'accountHome'} : {}),
            popupNotification: createPopupNotification({
                type: action, autoHide: dataUpdate.success, closeable: true, status, state, message
            })
        };
    } else if (emailUpdate) {
        const action = emailUpdate.success ? 'updateProfile:success' : 'updateProfile:failed';
        const status = emailUpdate.success ? 'success' : 'error';
        const message = !emailUpdate.success ? 'Failed to send verification email' : 'Check your inbox to verify email update';
        return {
            action,
            ...(emailUpdate.success ? {page: 'accountHome'} : {}),
            popupNotification: createPopupNotification({
                type: action, autoHide: emailUpdate.success, closeable: true, status, state, message
            })
        };
    }
    return {
        action: 'updateProfile:success',
        page: 'accountHome',
        popupNotification: createPopupNotification({
            type: 'updateProfile:success', autoHide: true, closeable: true, status: 'success', state,
            message: 'Account details updated successfully'
        })
    };
}

const Actions = {
    togglePopup,
    openPopup,
    closePopup,
    switchPage,
    openNotification,
    closeNotification,
    back,
    signout,
    signin,
    signup,
    updateSubscription,
    cancelSubscription,
    updateNewsletter,
    updateProfile,
    clearPopupNotification,
    editBilling,
    checkoutPlan
};

/** Handle actions in the App, returns updated state */
export default async function ActionHandler({action, data, state, api}) {
    const handler = Actions[action];
    if (handler) {
        return await handler({data, state, api}) || {};
    }
    return {};
}