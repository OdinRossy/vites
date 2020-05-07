package vites

import course.CourseService
import grails.core.GrailsApplication
import grails.plugin.springsecurity.annotation.Secured
import grails.plugins.GrailsPluginManager
import grails.plugins.PluginManagerAware
import org.springframework.http.HttpStatus
import security.User
import student.Student

class ApplicationController implements PluginManagerAware {

    GrailsApplication grailsApplication
    GrailsPluginManager pluginManager
    CourseService courseService

    def index() {
        [grailsApplication: grailsApplication, pluginManager: pluginManager]
    }

    @Secured(value = ['permitAll'])
    def testConnection() {
        render status: HttpStatus.OK
    }

    @Secured(value = ['isAuthenticated()'])
    def checkIsAuthenticated() {
        render status: HttpStatus.OK
    }

    @Secured(value = ['isAuthenticated()'])
    def myCourses() {
        def student = Student.findByUser(authenticatedUser as User)
        def courses = courseService.listCoursesByStudent(student.id)
        return courses
    }
}
