package course


import grails.gorm.transactions.Transactional
import grails.plugin.springsecurity.annotation.Secured
import grails.validation.ValidationException
import security.User
import student.Student

import static org.springframework.http.HttpStatus.*

@Secured(["ROLE_ADMIN", "ROLE_MANAGER", "ROLE_MENTOR", "ROLE_STUDENT"])
class CourseController {

    CourseService courseService

    static responseFormats = ['json', 'xml']
    static allowedMethods = [save: "POST", update: "PUT", delete: "DELETE"]

    def myCourses() {
        def student = Student.findByUser(authenticatedUser as User)
        respond student?.courses ?: []
    }

    def index() {
        respond courseService.list()
    }

    def show(Long id) {
        respond courseService.get(id)
    }

    @Transactional
    def save(Course course) {
        if (course == null) {
            notFound()
            return
        }
        if (course.hasErrors()) {
            transactionStatus.setRollbackOnly()
            respond course.errors
            return
        }

        try {
            courseService.save(course)
        } catch (ValidationException e) {
            respond course.errors
            return
        }

        respond course, [status: CREATED, view: "show"]
    }

    @Transactional
    def update(Course course) {
        if (course == null) {
            notFound()
            return
        }
        if (course.hasErrors()) {
            transactionStatus.setRollbackOnly()
            respond course.errors
            return
        }

        try {
            courseService.save(course)
        } catch (ValidationException e) {
            respond course.errors
            return
        }

        respond course, [status: OK, view: "show"]
    }

    @Transactional
    def delete(Long id) {
        if (id == null) {
            notFound()
            return
        }

        courseService.delete(id)

        render status: NO_CONTENT
    }

    private notFound() {
        render status: NOT_FOUND
    }
}
