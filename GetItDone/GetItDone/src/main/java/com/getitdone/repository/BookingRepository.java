package com.getitdone.repository;

import com.getitdone.model.Booking;
import com.getitdone.model.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {

        @Query("select b from Booking b where b.status = :status and b.startDateTime between :start and :end")
        List<Booking> findByStatusBetween(@Param("status") BookingStatus status,
                        @Param("start") LocalDateTime start,
                        @Param("end") LocalDateTime end);

        @Query("select case when count(b)>0 then true else false end from Booking b where b.worker.id = :workerId and b.status = 'CONFIRMED' and ((b.startDateTime < :end and b.endDateTime > :start))")
        boolean existsConfirmedOverlap(@Param("workerId") java.util.UUID workerId,
                        @Param("start") LocalDateTime start,
                        @Param("end") LocalDateTime end);

        @Query("select b from Booking b where b.client.id = :clientId")
        List<Booking> findByClientId(@Param("clientId") UUID clientId);

        @Query("select b from Booking b where b.worker.id = :workerId")
        List<Booking> findByWorkerId(@Param("workerId") UUID workerId);
}
