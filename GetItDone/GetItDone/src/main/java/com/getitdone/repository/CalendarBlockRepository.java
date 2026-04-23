package com.getitdone.repository;

import com.getitdone.model.CalendarBlock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.UUID;

@Repository
public interface CalendarBlockRepository extends JpaRepository<CalendarBlock, UUID> {

    @Query("select case when count(c)>0 then true else false end from CalendarBlock c where c.worker.id = :workerId and ((c.startDateTime < :end and c.endDateTime > :start))")
    boolean existsOverlap(@Param("workerId") UUID workerId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);
}
