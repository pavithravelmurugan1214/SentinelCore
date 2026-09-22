package backend.repository;
import java.util.List;
import java.util.Optional;
import backend.entity.Alert;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AlertRepository extends JpaRepository<Alert, Long> {
    List<Alert> findAllByOrderByIdDesc();

    List<Alert> findAllByOrderByIdAsc();

    Optional<Alert> findByTitleAndStatus(String title, String status);

    Optional<Alert> findByTitleAndStatusAndAssetId(String title, String status, Long assetId);

    List<Alert> findByAssetId(Long assetId);

    long countByStatus(String status);

    long countBySeverity(String severity);

    List<Alert> findByStatusAndSeverityAndEscalatedFalse(String status, String severity);

}