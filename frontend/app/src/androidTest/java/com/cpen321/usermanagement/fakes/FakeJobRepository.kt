package com.cpen321.usermanagement.fakes

import com.cpen321.usermanagement.data.local.models.Job
import com.cpen321.usermanagement.data.local.models.JobStatus
import com.cpen321.usermanagement.data.local.models.JobType
import com.cpen321.usermanagement.data.repository.JobRepository
import com.cpen321.usermanagement.data.remote.dto.Address
import com.cpen321.usermanagement.utils.Resource
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import java.time.LocalDateTime

/**
 * Fake implementation of JobRepository for testing.
 */
class FakeJobRepository : JobRepository {

    private val fakeJobs = listOf(
        Job(
            id = "job1",
            orderId = "order1",
            studentId = "student1",
            moverId = null,
            jobType = JobType.STORAGE,
            status = JobStatus.AVAILABLE,
            volume = 2.5,
            price = 25.0,
            pickupAddress = Address(
                lat = 49.2827,
                lon = -123.1207,
                formattedAddress = "123 Main St, Vancouver, BC"
            ),
            dropoffAddress = Address(
                lat = 49.2606,
                lon = -123.1133,
                formattedAddress = "456 University Ave, Vancouver, BC"
            ),
            scheduledTime = LocalDateTime.parse("2024-01-15T10:00:00")
        ),
        Job(
            id = "job2",
            orderId = "order2",
            studentId = "student2",
            moverId = null,
            jobType = JobType.RETURN,
            status = JobStatus.AVAILABLE,
            volume = 1.8,
            price = 18.0,
            pickupAddress = Address(
                lat = 49.2636,
                lon = -123.1386,
                formattedAddress = "789 Broadway, Vancouver, BC"
            ),
            dropoffAddress = Address(
                lat = 49.2706,
                lon = -123.1356,
                formattedAddress = "321 Commercial Dr, Vancouver, BC"
            ),
            scheduledTime = LocalDateTime.parse("2024-01-16T14:30:00")
        )
    )

    override fun getAvailableJobs(): Flow<Resource<List<Job>>> = flow {
        emit(Resource.Success(fakeJobs))
    }

    override fun getMoverJobs(): Flow<Resource<List<Job>>> = flow {
        emit(Resource.Success(emptyList()))
    }

    override fun getStudentJobs(): Flow<Resource<List<Job>>> = flow {
        emit(Resource.Success(emptyList()))
    }

    override suspend fun acceptJob(jobId: String): Resource<Unit> {
        return Resource.Success(Unit)
    }

    override suspend fun updateJobStatus(jobId: String, newStatus: JobStatus): Resource<Unit> {
        return Resource.Success(Unit)
    }

    override suspend fun requestPickupConfirmation(jobId: String): Resource<Unit> {
        return Resource.Success(Unit)
    }

    override suspend fun confirmPickup(jobId: String): Resource<Unit> {
        return Resource.Success(Unit)
    }

    override suspend fun requestDeliveryConfirmation(jobId: String): Resource<Unit> {
        return Resource.Success(Unit)
    }

    override suspend fun confirmDelivery(jobId: String): Resource<Unit> {
        return Resource.Success(Unit)
    }
}
