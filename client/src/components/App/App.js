import React, {Component} from 'react';
import {APP_NAME, CLIENT_VERSION, REACT_VERSION} from '../../config/config';
import ToolBar from "../Common/ToolBar/ToolBar/ToolBar";
import Panel from "../Common/Panel/Panel";
import {BrowserRouter, Route, Switch} from "react-router-dom";
import PathService from "../../services/api/PathService";
import CoursesPage from "../Pages/CoursesPage/CoursesPage";
import DashboardPage from "../Pages/DashboardPage/DashboardPage";
import ApiService from "../../services/api/ApiService";
import NotConnectedPage from "../Pages/NotConnectedPage/NotConnectedPage";
import Loader from "../Common/Loader/Loader";
import ToolBarService from "../../services/ToolBar/ToolBarService";
import PrivateRoute from "../PrivateRoute/PrivateRoute";
import StudentsPage from "../Pages/StudentsPage/StudentsPage";
import MentorPage from "../Pages/MentorPage/MentorPage";
import RatingPage from "../Pages/RatingPage/RatingPage";
import LoginForm from "../LoginForm/LoginForm";
import Auth from "../../security/auth";

import "./App.css";
import CourseDetails from "../Pages/CourseDetails/CourseDetails";
import CoursePageService from "../../services/Course/CoursePageService";

class App extends Component {

    pathService = new PathService();
    toolBarService = new ToolBarService();

    state = {
        serverInfo: {},
        appInfo: {
            name: APP_NAME,
            version: CLIENT_VERSION,
            react: REACT_VERSION
        },
        isConnected: false,
        isAuthenticated: false,
        isShowLoader: false,
        toolBarTopItems: [],
        userDetails: {
            username: '',
            password: ''
        },
        coursesPageMode: CoursePageService.modeAll(),
    };

    componentDidMount() {
        this.setToolBarActiveItem(window.location.pathname);
        ApiService.testConnection(this.setConnected, this.showLoader);
        Auth.checkAuthentication(this.setAuthenticated);

        setInterval(() =>
            ApiService.testConnection(this.setConnected, this.showLoader), 300000);
    }

    showLoader = () => {
        this.setState({
            isShowLoader: true
        })
    };

    hideLoader = () => {
        this.setState({
            isShowLoader: false
        })
    };

    setConnected = (isConnected) => {
        this.hideLoader();
        this.setState({
            isConnected
        })
    };

    setAuthenticated = (isAuthenticated) => {
        this.setState({
            isAuthenticated
        })
    }

    onToolBarItemClick = (pathName) => {
        if (this.pathService.isPathExists(pathName)) {
            if (window.location.pathname !== pathName) {
                this.setToolBarActiveItem(pathName);
            }
        } else {
            console.error('Unknown path:', pathName);
        }
    };

    setToolBarActiveItem = (currentPath) => {
        const currentPathName = this.pathService.getNameByPath(currentPath)
        const toolBarItems = this.toolBarService.getTopToolBarItems(this.onToolBarItemClick);

        const updatedToolBarItems =
            toolBarItems
                .map(it => it.id === currentPathName ?
                    {...it, isActive: true} : {...it, isActive: false}
                );

        this.setState({
            toolBarTopItems: updatedToolBarItems
        });
    }

    inputChangeHandler = (event) => {
        let {userDetails} = this.state;
        const target = event.target;

        userDetails[target.name] = target.value;

        this.setState({userDetails});
    };

    loginHandler = (e) => {
        e.preventDefault();
        Auth.login(this.state.userDetails);
    };

    logoutHandler = () => {
        Auth.removeToken();
        this.setState({
            userDetails: {
                username: '',
                password: ''
            },
        });
        this.redirectToDashBoard()
    };

    redirectToDashBoard = () => {
        window.location.pathname = this.pathService.main()
    };

    onCoursesPageModeChange = (coursesPageMode) => {
        if (CoursePageService.isModeValid(coursesPageMode)) {
            this.setState({
                coursesPageMode
            })
        } else {
            console.error('Unknown coursesPageMode:', coursesPageMode)
        }
    };

    getCoursesPageFetchFunction = coursesPageMode => {
        if (CoursePageService.isModeValid(coursesPageMode)) {
            switch (coursesPageMode) {
                case CoursePageService.modeAll():
                    return ApiService.fetchCourses
                case CoursePageService.modeMy():
                    return ApiService.fetchMyCourses
                default:
                    return () => []
            }
        } else {
            console.error('Unknown coursesPageMode:', coursesPageMode)
        }
    }

    render() {
        const {
            toolBarTopItems,
            isConnected,
            isShowLoader,
            appInfo,
            isAuthenticated,
            userDetails,
            coursesPageMode
        } = this.state;

        const getContentForNotConnected = () => (
            <NotConnectedPage
                title="Вы не подключены к серверу"
                onRefresh={() => ApiService.testConnection(
                    this.setConnected,
                    this.showLoader,
                    500
                )}
            />
        )

        const getLoginFormProps = () => {
            return {
                onSubmit: this.loginHandler,
                userDetails: userDetails,
                error: null,
                inputChangeHandler: this.inputChangeHandler
            }
        }

        const loginPathName = this.pathService.login()

        const getContentForConnected = () => {
            if (!isAuthenticated) {
                return <LoginForm {...getLoginFormProps()}/>
            }
            return (
                <Switch>
                    <Route path={this.pathService.login()}
                           exact
                           render={() => <LoginForm {...getLoginFormProps()}/>}/>

                    <PrivateRoute path={this.pathService.main()}
                                  exact
                                  isAuthenticated={isAuthenticated}
                                  loginPathname={loginPathName}>
                        <DashboardPage title="Главная"/>
                    </PrivateRoute>

                    <PrivateRoute path={this.pathService.courses()}
                                  exact
                                  isAuthenticated={isAuthenticated}
                                  loginPathname={loginPathName}>
                        <CoursesPage title="Курсы и стажировки"
                                     sort={this.sortCoursesByDate}
                                     modes={{
                                         all: CoursePageService.modeAll,
                                         my: CoursePageService.modeMy,
                                     }}
                                     isActiveMode={currentMode =>
                                         CoursePageService.isActiveMode(coursesPageMode, currentMode)}
                                     onModeChange={this.onCoursesPageModeChange}
                                     getLabelForMode={CoursePageService.getLabelForMode}
                                     getCourses={this.getCoursesPageFetchFunction(coursesPageMode)}/>
                    </PrivateRoute>

                    <PrivateRoute path={this.pathService.courses() + ':id'}
                                  isAuthenticated={isAuthenticated}
                                  loginPathname={loginPathName}>
                        <CourseDetails title="Курс"
                                       getCourse={ApiService.fetchCourse}/>
                    </PrivateRoute>

                    <PrivateRoute path={this.pathService.students()}
                                  isAuthenticated={isAuthenticated}
                                  loginPathname={loginPathName}>
                        <StudentsPage title="Студенты"/>
                    </PrivateRoute>

                    <PrivateRoute path={this.pathService.mentors()}
                                  isAuthenticated={isAuthenticated}
                                  loginPathname={loginPathName}>
                        <MentorPage title="Преподаватели"/>
                    </PrivateRoute>

                    <PrivateRoute path={this.pathService.rating()}
                                  isAuthenticated={isAuthenticated}
                                  loginPathname={loginPathName}>
                        <RatingPage title="Успеваемость"/>
                    </PrivateRoute>
                </Switch>
            )
        }

        return (
            <div className="App">
                <BrowserRouter>
                    <ToolBar {...this.getToolBarProps(toolBarTopItems, isConnected, appInfo, isAuthenticated)}/>
                    <Panel>
                        {
                            isShowLoader ? <Loader/> : null
                        }
                        {
                            isConnected ?
                                getContentForConnected() : getContentForNotConnected()
                        }
                    </Panel>
                </BrowserRouter>
            </div>
        )
    }

    getToolBarProps = (topItems, isConnected, appInfo, isAuthenticated) => {
        const bottomItems = this.toolBarService
            .getBottomToolBarItems(this.onToolBarItemClick)
        const brandItemProps = this.toolBarService
            .getToolBarBrandItemProps(
                () =>
                    ApiService.testConnection(this.setConnected, this.showLoader, 500),
                isConnected,
                appInfo.name.toUpperCase(),
            )

        const logOutItemProps = this.toolBarService.getToolBarLogOutItemProps(this.logoutHandler)

        return {
            brandItemProps,
            logOutItemProps,
            topItems,
            bottomItems,
            appInfo,
            isAuthenticated,
        }
    }

    sortCoursesByDate = courses => {
        return [...courses].sort((a, b) => (a.startDate > b.startDate) ? 1 : -1)
    }
}

export default App;