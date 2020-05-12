package student

import grails.gorm.services.Service
import grails.util.Holders
import rating.StudentRating

interface IStudentService {

    Student get(Serializable id)

    List<Student> list(Map args)

    Long count()

    void delete(Serializable id)

    Student save(Student student)

}

@Service(Student)
abstract class StudentService implements IStudentService {

    Student getAuthenticatedStudent() {
        def currentUser = Holders.applicationContext.springSecurityService.currentUser

        if (currentUser) {
            return Student.findByUser(currentUser)
        }

        return null
    }

    float getAverageRating(Student student) {
        def studentRatingList = StudentRating.findAllByStudent(student)
        return Holders.applicationContext.ratingUtilService.getAverageRating(studentRatingList)
    }

}