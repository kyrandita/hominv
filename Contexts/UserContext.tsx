'use client'
import React, { PropsWithChildren, useReducer } from "react";

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
                // we could double check if user is changing here, but for this demo we don't care
                return new UserState({username:'HLuker'});
            case 'logout':
                return new UserState()
            default:
                return prevState;
        }
    };
    const [state, dispatch] = useReducer<UserState, [action: UserContextActions]>(reducerFunction, new UserState());

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