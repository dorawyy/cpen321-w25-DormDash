package com.cpen321.usermanagement.fakes

import android.net.Uri
import com.cpen321.usermanagement.data.remote.dto.User
import com.cpen321.usermanagement.data.repository.ProfileRepository

/**
 * Fake implementation of ProfileRepository for testing.
 */
class FakeProfileRepository : ProfileRepository {

    private var fakeUser = User(
        _id = "test_mover_id_123",
        userRole = "mover",
        email = "testmover@test.com",
        name = "Test Mover",
        bio = "Test mover bio",
        profilePicture = "https://via.placeholder.com/150",
        availability = mapOf(
            "MONDAY" to listOf(listOf("09:00", "17:00")),
            "TUESDAY" to listOf(listOf("09:00", "17:00")),
            "WEDNESDAY" to listOf(listOf("09:00", "17:00")),
            "THURSDAY" to listOf(listOf("09:00", "17:00")),
            "FRIDAY" to listOf(listOf("09:00", "17:00"))
        ),
        capacity = 10.0f,
        carType = "Sedan",
        plateNumber = "TEST123",
        credits = 100.0f
    )

    override suspend fun getProfile(): Result<User> {
        return Result.success(fakeUser)
    }

    override suspend fun updateProfile(name: String, bio: String, profilePicture: String): Result<User> {
        fakeUser = fakeUser.copy(
            name = name,
            bio = bio,
            profilePicture = profilePicture
        )
        return Result.success(fakeUser)
    }

    override suspend fun deleteProfile(): Result<Unit> {
        return Result.success(Unit)
    }

    override suspend fun uploadProfilePicture(pictureUri: Uri): Result<String> {
        return Result.success("https://fake.url/picture.jpg")
    }

    override suspend fun updateMoverAvailability(availability: Map<String, List<List<String>>>): Result<User> {
        fakeUser = fakeUser.copy(availability = availability)
        return Result.success(fakeUser)
    }

    override suspend fun cashOut(): Result<User> {
        fakeUser = fakeUser.copy(credits = 0.0f)
        return Result.success(fakeUser)
    }
}

