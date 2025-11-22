'use client'
import React, { PropsWithChildren, useEffect, useReducer } from "react";

class UserState {
    public username: string;
    public constructor({username = ''} = {}) {
        this.username = username;
    }
    
    get isLoggedIn() {
        return Boolean(this.username);
    }

    get welcomeMessage() {
        if (this.isLoggedIn) {
            return `Welcome ${this.username}`;
        }
        return 'not Logged in';
    }
}

type UContext = {
    user?: UserState,
    dispatch?: React.ActionDispatch<[action: UserContextActions]>,
}
const MixedContext = React.createContext<UContext>({})
const UserContext = React.createContext<UserState>(new UserState());
const DispatchContext = React.createContext<React.ActionDispatch<[action: UserContextActions]> | null>(null);

interface LoginAction {
    type: 'login',
    token?: string,
}

interface LogoutAction {
    type: 'logout',
}

type UserContextActions = LoginAction | LogoutAction

function ProviderComponent ({ children }: PropsWithChildren) {

    const reducerFunction = (prevState: UserState, action: UserContextActions) =>{
        console.log({prevState, action});
        switch (action.type) {
            case 'login':
                // if token is defined, would check with server if token is valid and retrieve actual user data and such... maybe not right here... not sure yet
                window.sessionStorage.setItem('loginToken', 'ABCD')
                return new UserState({username:'HLuker'});
            case 'logout':
                // it may be prudent to `.clear()` instead, but for my purposes right now this is enough
                window.sessionStorage.removeItem('loginToken')
                return new UserState()
            default:
                return prevState;
        }
    };
    const [state, dispatch] = useReducer<UserState, [action: UserContextActions]>(reducerFunction, new UserState());

    useEffect(() => {
        const tok = window.sessionStorage.getItem('loginToken')
        if (tok) {
            // this should at least persist login longer for now
            // need to consider keepalive and timeout behavior when setting up actual security process
            dispatch({type:'login', token: tok})
        }
    }, [])

    return (
        <UserContext.Provider value={state}>
            <DispatchContext.Provider value={dispatch}>
                <MixedContext.Provider value={{ dispatch, user: state }}>
                    {children}
                </MixedContext.Provider>
            </DispatchContext.Provider>
        </UserContext.Provider>
    );
};

export default UserContext;
export { ProviderComponent, DispatchContext, UserState };